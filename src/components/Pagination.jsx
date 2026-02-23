import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    // Simple logic: Show all if small, or implement windowing (1 2 ... 5 6 7 ... N)
    // For MVP, if pages < 10 show all, else simple window
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    // Improved Windowing Logic for many pages
    // e.g., 1 ... 4 5 6 ... 10
    const getPageNumbers = () => {
        const delta = 2; // numbers around current
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        let l;
        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }
        return rangeWithDots;
    };

    const displayPages = totalPages > 7 ? getPageNumbers() : pages;

    return (
        <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: currentPage === 1 ? '#f5f5f5' : 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center'
                }}
            >
                <FiChevronLeft />
            </button>

            {displayPages.map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                    disabled={page === '...'}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: currentPage === page ? '#333' : 'white',
                        color: currentPage === page ? 'white' : '#333',
                        cursor: page === '...' ? 'default' : 'pointer',
                        fontWeight: currentPage === page ? 'bold' : 'normal'
                    }}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: currentPage === totalPages ? '#f5f5f5' : 'white',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center'
                }}
            >
                <FiChevronRight />
            </button>
        </div>
    );
};

export default Pagination;
