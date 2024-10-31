// SPDX-License-Identifier: ISC
pragma solidity ^0.8.19;

interface IFraxlendPairDeployer {
    function getAllPairAddresses() external view returns (address[] memory _deployedPairs);
}