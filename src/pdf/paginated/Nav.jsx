import React, { useState, useEffect, useRef } from 'react';
import { CgChevronUp, CgChevronDown } from 'react-icons/cg';

const PDFNavigationBar = ({ page, pdf, onPreviousPage, onNextPage }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hideTimeoutRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);
      
      // Only react to significant scroll changes (avoid jitter)
      if (scrollDifference < 10) return;
      
      // Clear any existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Show immediately when scrolling
      setIsVisible(true);
      
      // Hide after scroll stops (with delay)
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide after delay
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 1500); // Hide after 1.5 seconds of no scroll
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show and keep visible longer
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000); // Hide after 3 seconds when scrolling up
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener with throttling
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Show on mouse movement near the area
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Show if mouse is in bottom-right corner area
      if (clientX > innerWidth - 150 && clientY > innerHeight - 150) {
        setIsVisible(true);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      document.removeEventListener('mousemove', handleMouseMove);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  // Show on hover over the navigation bar itself
  const handleMouseEnter = () => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 1000);
  };

  return (
    <div 
      className={`pdf-nav-bar ${!isVisible ? 'hidden' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        onClick={onPreviousPage} 
        disabled={!page || page.pageNumber <= 1}
        title="Previous page"
      >
        <span className="inner">
          <CgChevronUp />
        </span>
      </button>

      <label>
        {page?.pageNumber || 1} / {pdf?.numPages || 1}
      </label>
      
      <button 
        onClick={onNextPage} 
        disabled={!page || page.pageNumber >= pdf?.numPages}
        title="Next page"
      >
        <span className="inner">
          <CgChevronDown />
        </span>
      </button>
    </div>
  );
};

export default PDFNavigationBar;