// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Counter {
    // Variable to hold the counter value
    int256 public count;

    // Event to emit when counter changes
    event CounterChanged(int256 newCount);

    // Constructor to initialize the counter value (optional)
    constructor(int256 _initialCount) {
        count = _initialCount;
    }

    // Function to increment the counter by 1
    function increment() public {
        count += 1;
        emit CounterChanged(count);
    }

    // Function to decrement the counter by 1
    function decrement() public {
        count -= 1;
        emit CounterChanged(count);
    }

    // Function to reset the counter to zero
    function reset() public {
        count = 0;
        emit CounterChanged(count);
    }

    // Function to retrieve the current count (optional since count is public)
    function getCount() public view returns (int256) {
        return count;
    }
}
