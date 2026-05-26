import React from "react";

export default function Profile() {
    return (
        <div className="flex flex-start gap-2 items-center">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div className="flex flex-col roboto-flex">
                <span className="font-semibold text-medium-blue text-1x1">Ava Greenreach</span>
                <span className="text-xs light-gray">Movie Lover</span>
            </div>
        </div>
    );
}
