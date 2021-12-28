import React, { useContext, useEffect, useState } from 'react';

let delay = 5000;

export const ErrorContext = React.createContext({setError: ()=>null, error:""});

export const useErrorHandler = ()=> {
    const {setError} = useContext(ErrorContext);
    return (msg, del) => {
        if(Number.isInteger(del)) delay = del;
        return setError(msg);
    };
}

export default function ErrorHandler() {
    const {error, setError} = useContext(ErrorContext);
    const [msg, setMsg] = useState(error);

    useEffect(()=> {
        if(error) {
            setTimeout(()=>setError(""), delay);
            setMsg(error);
        }
    }, [error, delay]);
    
    return (
        <div style={{
            position: "fixed",
            zIndex: 10000,
            top: "8px",
            right: error? "8px" : '-100%',
            border: "1px solid red",
            color: 'red',
            transition: 'all 0.8s',
        }}>
            {typeof msg === "string"? msg : msg?.message || "An unknown error occurred!"}
        </div>
    )
}
