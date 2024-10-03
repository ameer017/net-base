import { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

export const useContract = () => {
  const { contract } = useContext(Web3Context);
  return contract;
};
