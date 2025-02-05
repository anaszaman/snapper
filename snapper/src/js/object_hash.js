// Universal Module Definition (UMD) pattern
(function(root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        let target;
        if (typeof window !== 'undefined') {
            target = window;
        } else if (typeof global !== 'undefined') {
            target = global;
        } else if (typeof self !== 'undefined') {
            target = self;
        }
        target.objectHash = factory();
    }
}(function() {
    'use strict';

    const crypto = require('crypto');

    // Main hash function
    function hash(object, options) {
        options = normalizeOptions(object, options);
        return writeToHash(object, options);
    }

    // Normalize hash options
    function normalizeOptions(object, options = {}) {
        // Set defaults
        options.algorithm = options.algorithm?.toLowerCase() || 'sha1';
        options.encoding = options.encoding?.toLowerCase() || 'hex';
        options.excludeValues = !!options.excludeValues;

        // Validate options
        if (typeof object === 'undefined') {
            throw new Error('Object argument required.');
        }

        // Validate algorithm
        const validAlgorithms = crypto.getHashes ? crypto.getHashes().slice() : ['sha1', 'md5'];
        validAlgorithms.push('passthrough');

        const validEncodings = ['buffer', 'hex', 'binary', 'base64'];

        if (!validAlgorithms.includes(options.algorithm)) {
            throw new Error(`Algorithm "${options.algorithm}" not supported. Supported values: ${validAlgorithms.join(', ')}`);
        }

        if (!validEncodings.includes(options.encoding) && options.algorithm !== 'passthrough') {
            throw new Error(`Encoding "${options.encoding}" not supported. Supported values: ${validEncodings.join(', ')}`);
        }

        return options;
    }

    // Check if function is native
    function isNativeFunction(func) {
        if (typeof func !== 'function') return false;
        const nativeFunctionRegex = /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i;
        return nativeFunctionRegex.test(Function.prototype.toString.call(func));
    }

    // Write object to hash
    function writeToHash(object, options) {
        const hash = options.algorithm !== 'passthrough' 
            ? crypto.createHash(options.algorithm)
            : new PassthroughHash();

        // Ensure hash has consistent interface
        if (typeof hash.write === 'undefined') {
            hash.write = hash.update;
            hash.end = hash.update;
        }

        const context = createHashContext(options, hash);
        context.dispatch(object);

        if (hash.update || hash.end) {
            hash.end('');
        }

        if (hash.digest) {
            return hash.digest(options.encoding === 'buffer' ? undefined : options.encoding);
        }

        const result = hash.read();
        return options.encoding === 'buffer' ? result : result.toString(options.encoding);
    }

    // Simple passthrough hash implementation
    class PassthroughHash {
        constructor() {
            this.buf = '';
        }

        write(str) {
            this.buf += str;
        }

        end(str) {
            this.buf += str;
        }

        read() {
            return this.buf;
        }
    }

    // Create hash context for handling different types
    function createHashContext(options, hash, seen = []) {
        const write = (str) => {
            return hash.update ? hash.update(str, 'utf8') : hash.write(str, 'utf8');
        };

        return {
            dispatch(value) {
                if (options.replacer) {
                    value = options.replacer(value);
                }

                const type = value === null ? 'null' : typeof value;
                return this[`_${type}`](value);
            },

            _object(obj) {
                const objType = Object.prototype.toString.call(obj)
                    .toLowerCase()
                    .match(/\[object (.+)\]/i)[1];

                // Handle circular references
                const seenIndex = seen.indexOf(obj);
                if (seenIndex >= 0) {
                    return this.dispatch(`[CIRCULAR:${seenIndex}]`);
                }
                seen.push(obj);

                // Handle special types
                if (Buffer.isBuffer && Buffer.isBuffer(obj)) {
                    write('buffer:');
                    write(obj);
                    return;
                }

                // Handle regular objects
                if (objType === 'object' || objType === 'function') {
                    const keys = Object.keys(obj).sort();
                    
                    if (options.respectType !== false || !isNativeFunction(obj)) {
                        keys.unshift('prototype', '__proto__', 'constructor');
                    }

                    write(`object:${keys.length}:`);
                    
                    keys.forEach(key => {
                        this.dispatch(key);
                        write(':');
                        if (!options.excludeValues) {
                            this.dispatch(obj[key]);
                        }
                        write(',');
                    });
                    return;
                }

                // Handle unknown types
                if (!this[`_${objType}`]) {
                    if (options.ignoreUnknown) {
                        write(`[${objType}]`);
                        return;
                    }
                    throw new Error(`Unknown object type "${objType}"`);
                }

                this[`_${objType}`](obj);
            },

            // Add handlers for primitive types
            _array(arr, unordered = options.unorderedArrays !== false) {
                write(`array:${arr.length}:`);
                
                if (!unordered || arr.length <= 1) {
                    arr.forEach(item => this.dispatch(item));
                    return;
                }

                // Handle unordered arrays
                const mapped = arr.map(item => {
                    const hash = new PassthroughHash();
                    const contextNew = createHashContext(options, hash, seen.slice());
                    contextNew.dispatch(item);
                    return hash.read().toString();
                });

                mapped.sort();
                mapped.forEach(item => write(item));
            },

            _date(date) { 
                write(`date:${date.toJSON()}`);
            },

            _symbol(sym) {
                write(`symbol:${sym.toString()}`);
            },

            _error(err) {
                write(`error:${err.toString()}`);
            },

            _boolean(bool) {
                write(`bool:${bool.toString()}`);
            },

            _string(str) {
                write(`string:${str.length}:`);
                write(str);
            },

            _function(fn) {
                write('fn:');
                if (isNativeFunction(fn)) {
                    this.dispatch('[native]');
                } else {
                    this.dispatch(fn.toString());
                }
                
                if (options.respectFunctionNames !== false) {
                    this.dispatch(`function-name:${String(fn.name)}`);
                }

                if (options.respectFunctionProperties) {
                    this._object(fn);
                }
            },

            _number(num) {
                write(`number:${num.toString()}`);
            },

            _null() {
                write('Null');
            },

            _undefined() {
                write('Undefined');
            },

            _regexp(regex) {
                write(`regex:${regex.toString()}`);
            },

            _uint8array(arr) {
                write('uint8array:');
                this.dispatch(Array.prototype.slice.call(arr));
            },

            // ... additional typed array handlers ...
        };
    }

    // Export main function and convenience methods
    const objectHash = hash;
    objectHash.sha1 = obj => hash(obj);
    objectHash.keys = obj => hash(obj, { excludeValues: true, algorithm: 'sha1', encoding: 'hex' });
    objectHash.MD5 = obj => hash(obj, { algorithm: 'md5', encoding: 'hex' });
    objectHash.keysMD5 = obj => hash(obj, { algorithm: 'md5', encoding: 'hex', excludeValues: true });
    objectHash.writeToStream = writeToHash;

    return objectHash;
}));