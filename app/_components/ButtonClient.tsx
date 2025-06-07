'use client'; // this makes the page a client component which is required for the use state (on click, etc)

import React from 'react';
import { useState } from 'react';

export default function ButtonClient() {
    const [count, setCount] = useState(0);

    const handleClick = () => {
        setCount(count + 1);
        console.log(count);
    };

    return (
        <button onClick={handleClick}>
            Click me {count}
        </button>
    );
}