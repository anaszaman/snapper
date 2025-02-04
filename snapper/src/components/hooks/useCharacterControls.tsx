import { useEffect, useState } from "react";

interface Movement {
    FWD : boolean,
    RT : boolean,
    BKWD : boolean,
    LFT : boolean,
}

const useCharacterControls = () => {
    const [direction, setDir] = useState<Movement>({
        FWD: false,
        RT: false,
        BKWD: false,
        LFT: false
    })

    useEffect(() => {
        if (typeof window !== 'object') return
        const handleMovmentState = (ev: KeyboardEvent) => {
            setDir(prevDirection => {
                const newDirection = { ...prevDirection }; // Make a copy of the current state
                if (ev.key.toLocaleLowerCase() === 'w') {
                    newDirection.FWD = true;
                    newDirection.BKWD = false;
                }
                if (ev.key.toLocaleLowerCase() === 's') {
                    newDirection.BKWD = true;
                    newDirection.FWD = false;
                }
                if (ev.key.toLocaleLowerCase() === 'a') {
                    newDirection.LFT = true;
                    newDirection.RT = false;
                }
                if (ev.key.toLocaleLowerCase() === 'd') {
                    newDirection.RT = true;
                    newDirection.LFT = false;
                }
                return newDirection; // Return the updated state
            });
        };
        
        const revokeMovementState = () => {
            setDir({
                FWD: false,
                BKWD: false,
                RT: false,
                LFT: false,
            })
        }

        window.addEventListener('keydown', handleMovmentState, false);
        window.addEventListener('keyup', revokeMovementState, false);

        return () => {
            window.removeEventListener('keyup', revokeMovementState, false);
            window.removeEventListener('keydown', handleMovmentState, false);
        }
    }, [window])
    return direction
};

export default useCharacterControls;
export { Movement }