// components/AnimatedList.tsx
import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

interface AnimatedItemProps {
    children: ReactNode;
    delay?: number;
    index: number;
    onMouseEnter?: () => void;
    onClick?: () => void;
    isSelected?: boolean; // New prop for visual selection
}

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick, isSelected }: AnimatedItemProps) => {
    const ref = useRef<HTMLDivElement>(null);
    // FIX 1: Change 'triggerOnce: false' to 'once: false' for newer Framer Motion versions
    const inView = useInView(ref, { once: false });

    return (
        <motion.div
            ref={ref}
            data-index={index}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
            initial={{ scale: 0.7, opacity: 0, y: 20 }} // Added y for vertical animation
            animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.7, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: delay }}
            className={`cursor-pointer ${isSelected ? 'bg-gray-100' : ''}`} // Apply selected style here
        >
            {children}
        </motion.div>
    );
};

interface AnimatedListProps<T> {
    items: T[];
    renderItem: (item: T, index: number, isSelected: boolean) => ReactNode; // Function to render each item
    onItemSelect?: (item: T, index: number) => void;
    showGradients?: boolean;
    enableArrowNavigation?: boolean;
    className?: string;
    itemClassName?: string;
    displayScrollbar?: boolean;
    initialSelectedIndex?: number;
}

const AnimatedList = <T,>({
    items = [],
    renderItem,
    onItemSelect,
    showGradients = true,
    enableArrowNavigation = true,
    className = '',
    itemClassName = '',
    displayScrollbar = true,
    initialSelectedIndex = -1,
}: AnimatedListProps<T>) => {
    const listRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
    const [keyboardNav, setKeyboardNav] = useState(false);
    const [topGradientOpacity, setTopGradientOpacity] = useState(0);
    const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        setTopGradientOpacity(Math.min(scrollTop / 50, 1));
        const bottomDistance = scrollHeight - (scrollTop + clientHeight);
        setBottomGradientOpacity(
            scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
        );
    };

    useEffect(() => {
        if (!enableArrowNavigation) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if the dropdown is open and the active element is within the navbar context
            // You might need to refine this condition based on your exact dropdown closing logic.
            // For a dropdown that opens and closes, simply listening to window is often fine.

            if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
                e.preventDefault();
                setKeyboardNav(true);
                setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
            } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
                e.preventDefault();
                setKeyboardNav(true);
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    e.preventDefault();
                    if (onItemSelect) {
                        onItemSelect(items[selectedIndex], selectedIndex);
                    }
                }
            }
        };

        const timeoutId = setTimeout(() => {
            window.addEventListener('keydown', handleKeyDown);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);


    useEffect(() => {
        if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
        const container = listRef.current;
        // FIX 2 & 3: Cast to HTMLElement to access offsetTop and offsetHeight
        const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;

        if (selectedItem) {
            const extraMargin = 50;
            const containerScrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const itemTop = selectedItem.offsetTop;
            const itemBottom = itemTop + selectedItem.offsetHeight;
            if (itemTop < containerScrollTop + extraMargin) {
                container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
            } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
                container.scrollTo({
                    top: itemBottom - containerHeight + extraMargin,
                    behavior: 'smooth',
                });
            }
        }
        setKeyboardNav(false);
    }, [selectedIndex, keyboardNav]);

    return (
        <div className={`relative ${className}`}>
            <div
                ref={listRef}
                className={`max-h-[400px] overflow-y-auto ${
                    displayScrollbar
                        ? "[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-[4px]"
                        : "scrollbar-hide"
                }`}
                onScroll={handleScroll}
                style={{
                    scrollbarWidth: displayScrollbar ? "thin" : "none",
                    scrollbarColor: "#a0aec0 #edf2f7", // Adjusting for light background: thumb and track
                }}
            >
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                        <AnimatedItem
                            key={item.hasOwnProperty('_id') ? (item as any)._id : index}
                            delay={index * 0.05}
                            index={index}
                            onMouseEnter={() => setSelectedIndex(index)}
                            onClick={() => {
                                setSelectedIndex(index);
                                if (onItemSelect) {
                                    onItemSelect(item, index);
                                }
                            }}
                            isSelected={selectedIndex === index}
                        >
                            {renderItem(item, index, selectedIndex === index)}
                        </AnimatedItem>
                    ))}
                </AnimatePresence>
            </div>
            {showGradients && (
                <>
                    <div
                        className="absolute top-0 left-0 right-0 h-[50px] bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-300 ease"
                        style={{ opacity: topGradientOpacity }}
                    ></div>
                    <div
                        className="absolute bottom-0 left-0 right-0 h-[50px] bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 ease"
                        style={{ opacity: bottomGradientOpacity }}
                    ></div>
                </>
            )}
        </div>
    );
};

export default AnimatedList;