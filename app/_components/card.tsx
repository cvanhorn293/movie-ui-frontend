"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevLeft, ChevRight } from "./global/icons";

/* DATAHEADER STRUCTURE
    headerText: The text to display in the header of the card for this column.
    headerWidth: The width of the column as a percentage (e.g., 30 for 30% width).
    dataKey: (Optional) The key to use from the data row for this column. If not provided, it will attempt to use a key derived from the headerText.
    renderCell: (Optional) A custom function to render the cell content. It receives the entire row of data and should return a React node. This allows for complex cell rendering beyond just displaying a single value.
*/

interface DataHeader {
    headerText: string;
    headerWidth: number;
    dataKey?: string;
    renderCell?: (row: Record<string, unknown>) => React.ReactNode;
}

/* CARD COMPONENT PROPS
    colSpan: Grid column span (1-12) for the card width in a 12-column grid
    title: The title text displayed at the top of the card.
    icon: (Optional) An icon to display next to the title. Can be a string (URL) or a React component.
    button: (Optional) A boolean indicating whether to show a button in the card header.
    buttonText: (Optional) The text to display on the button if button is true.
    dataHeader: (Optional) An array of DataHeader objects that define the structure of the data to be displayed in the card.
    data: (Optional) An array of data objects to be displayed in the card. Each object should have keys corresponding to the dataKey values in dataHeader or keys derived from headerText.
    isLoading: (Optional) A boolean indicating whether the data is currently being loaded. If true, a loading state will be displayed.
    error: (Optional) A string containing an error message if there was an error loading the data. If provided, the error message will be displayed.
    pagination: (Optional) A boolean indicating whether to enable pagination for the data displayed in the card.
 */

interface CardProps {
    colSpan: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    title: string;
    icon?: string | React.ComponentType<React.SVGProps<SVGSVGElement>>;
    button?: boolean;
    buttonText?: string;
    dataHeader?: DataHeader[];
    data?: Record<string, unknown>[];
    isLoading?: boolean;
    error?: string | null;
    pagination?: boolean;
}

export default function Card({ colSpan = 12, title, icon, button, buttonText, dataHeader, data, isLoading, error, pagination = false }: CardProps) {
    const IconComponent = icon;
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Map colSpan to Tailwind classes
    const colSpanClasses: Record<number, string> = {
        1: "col-span-1",
        2: "col-span-2",
        3: "col-span-3",
        4: "col-span-4",
        5: "col-span-5",
        6: "col-span-6",
        7: "col-span-7",
        8: "col-span-8",
        9: "col-span-9",
        10: "col-span-10",
        11: "col-span-11",
        12: "col-span-12",
    };

    // Pagination
    const totalItems = data?.length || 0;
    const totalPages = pagination ? Math.ceil(totalItems / itemsPerPage) : 1;
    const startIndex = pagination ? (currentPage - 1) * itemsPerPage : 0;
    const endIndex = pagination ? startIndex + itemsPerPage : totalItems;
    const paginatedData = pagination ? data?.slice(startIndex, endIndex) : data;

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className={`${colSpanClasses[colSpan]} bg-white rounded-lg border border-gray py-[36px] px-[32px]`}>
            <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                    {IconComponent && (typeof IconComponent === "string" ? <Image src={IconComponent} alt={`${title} icon`} width={24} height={24} /> : <IconComponent className="w-6 h-6 text-dark" />)}
                    <h2 className="text-lg font-medium text-dark roboto-flex">{title}</h2>
                </div>
                {button && <button className="text-xs font-medium text-brand-blue border border-brand-blue py-1 px-3 rounded-md cursor-pointer">{buttonText}</button>}
            </div>
            {dataHeader && (
                <div className="flex flex-row gap-4 border-y border-gray py-2 mb-2">
                    {dataHeader.map((header, index) => (
                        <p key={index} className="text-md font-normal light-gray" style={{ width: `${header.headerWidth}%` }}>
                            {header.headerText}
                        </p>
                    ))}
                </div>
            )}
            <div className="w-full min-h-40">
                {isLoading && (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                )}
                {error && (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-red-500">Error: {error}</p>
                    </div>
                )}
                {!isLoading && !error && paginatedData && paginatedData.length > 0 && (
                    <div className="flex flex-col">
                        {paginatedData.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex flex-row gap-4 py-4 border-b border-gray-100 last:border-0">
                                {dataHeader?.map((header, colIndex) => {
                                    // Use custom render function if provided
                                    if (header.renderCell) {
                                        return (
                                            <div key={colIndex} className="text-sm text-dark" style={{ width: `${header.headerWidth}%` }}>
                                                {header.renderCell(row)}
                                            </div>
                                        );
                                    }
                                    // Use dataKey if provided
                                    const value = header.dataKey ? row[header.dataKey] : row[header.headerText.toLowerCase().replace(/\s+/g, "_")];
                                    return (
                                        <p key={colIndex} className="text-sm text-dark" style={{ width: `${header.headerWidth}%` }}>
                                            {String(value ?? "")}
                                        </p>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && !error && (!data || data.length === 0) && (
                    <div className="flex items-center justify-center h-40">
                        <p className="text-gray-500">No data available</p>
                    </div>
                )}
            </div>
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 border border-gray rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevLeft className="w-4 h-4" />
                        Previous
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button key={page} onClick={() => handlePageClick(page)} className={`px-3 py-1 text-sm rounded-md ${page === currentPage ? "bg-brand-blue text-white" : "text-gray-700 border border-white hover:border hover:border-gray-300"}`}>
                                {page}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 border border-gray rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                        <ChevRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
