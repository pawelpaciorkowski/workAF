import React from 'react';
import {ChevronDoubleLeft, ChevronDoubleRight} from "react-bootstrap-icons";


interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages === 1) return null;
    let startPage = Math.max(currentPage - 1, 1);
    let endPage = Math.min(currentPage , totalPages);
  
    
    startPage = Math.max(startPage, 1);
    endPage = Math.min(endPage, totalPages);
  
    const pagesToShow = Array.from({ length: (endPage - startPage + 1) }, (_, i) => startPage + i);
  
    return (
      <div className="flex justify-end mr-4 mb-2">
        {currentPage !== 1 && (
          <button className='mr-1 px-2 py-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 text-sm rounded shadow-lg hover:shadow-xl transition-shadow duration-300' onClick={() => onPageChange(currentPage - 1)}><ChevronDoubleLeft size={12} /></button>
        )}
        {pagesToShow.map((page) => (
          <button
            key={page}
            className={`${currentPage === page ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white' : 'bg-white'} text-black-500 px-2 py-1 text-sm rounded shadow-lg hover:shadow-xl transition-shadow duration-300`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        {currentPage !== totalPages && (
          <button className='ml-1 bg-gradient-to-r from-blue-400 to-blue-500 text-white px-2 py-1 text-sm rounded shadow-lg hover:shadow-xl transition-shadow duration-300' onClick={() => onPageChange(currentPage + 1)}><ChevronDoubleRight size={12} /></button>
        )}
      </div>
    );
  };
  
  
  
  


export default Pagination;
