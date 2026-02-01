// SPDX-License-Identifier: ISC
pragma solidity ^0.8.19;

interface IFraxlendPair {
    function getUserSnapshot(address _address) external view returns (uint256 _userAssetShares, uint256 _userBorrowShares, uint256 _userCollateralBalance);
    function exchangeRateInfo() external view returns (uint32 lastTimestamp, uint224 exchangeRate);
    function totalBorrow() external view returns (uint128 amount, uint128 shares);
    function maxLTV() external view returns (uint256 maxLTV);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function getConstants()
        external
        pure
        returns (
            uint256 _LTV_PRECISION,
            uint256 _LIQ_PRECISION,
            uint256 _UTIL_PREC,
            uint256 _FEE_PRECISION,
            uint256 _EXCHANGE_PRECISION,
            uint256 _DEVIATION_PRECISION,
            uint256 _RATE_PRECISION,
            uint256 _MAX_PROTOCOL_FEE
        );

}