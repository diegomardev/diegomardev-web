import React, { useState } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import confetti from 'canvas-confetti';
  let candles_init =
  [
    {
        "id": 1,
        "top": -20.75,
        "left": 53
    },
    {
        "id": 2,
        "top": -17.75,
        "left": 38.6
    },
    {
        "id": 3,
        "top": -17.25,
        "left": 28.199999999999996
    },
    {
        "id": 4,
        "top": -13.25,
        "left": 17
    },
    {
        "id": 5,
        "top": -4.75,
        "left": 6.6000000000000005
    },
    {
        "id": 6,
        "top": -18.25,
        "left": 63
    },
    {
        "id": 7,
        "top": -16.75,
        "left": 74.6
    },
    {
        "id": 8,
        "top": -12.25,
        "left": 84.2
    },
    {
        "id": 9,
        "top": -5.75,
        "left": 92.2
    },
    {
        "id": 10,
        "top": 3.2500000000000036,
        "left": 90.2
    },
    {
        "id": 11,
        "top": 7.75,
        "left": 82.19999999999999
    },
    {
        "id": 12,
        "top": 10.75,
        "left": 72.2
    },
    {
        "id": 13,
        "top": 13.75,
        "left": 62.2
    },
    {
        "id": 14,
        "top": 12.25,
        "left": 50.2
    },
    {
        "id": 15,
        "top": 10.75,
        "left": 37.4
    },
    {
        "id": 16,
        "top": 7.75,
        "left": 24.2
    },
    {
        "id": 17,
        "top": 4.7499999999999964,
        "left": 13.8
    }
];
//quiero exportar candles para poder usarlo en Birthday_Cake.jsx
export {candles_init};