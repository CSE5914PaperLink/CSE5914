(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Sidebar",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function Sidebar({ library, selectedDocs, onToggleSelect, onDelete }) {
    _s();
    const [collapsed, setCollapsed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const formatAuthors = (authors)=>{
        if (!authors) return null;
        if (Array.isArray(authors)) return authors.slice(0, 2).join(", ");
        if (typeof authors === "string") {
            try {
                const parsed = JSON.parse(authors);
                if (Array.isArray(parsed)) return parsed.slice(0, 2).join(", ");
            } catch  {
                const maybeJson = authors.trim().replace(/'/g, '"');
                try {
                    const parsed2 = JSON.parse(maybeJson);
                    if (Array.isArray(parsed2)) return parsed2.slice(0, 2).join(", ");
                } catch  {}
            }
            return authors;
        }
        return String(authors);
    };
    if (collapsed) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
            className: "w-14 bg-white border-r p-2 flex flex-col items-center min-h-0",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "p-2 rounded hover:bg-gray-100",
                title: "Expand My Papers",
                onClick: ()=>setCollapsed(false),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-5 h-5 text-neutral-900",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: "2",
                        d: "M15 19l-7-7 7-7"
                    }, void 0, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                        lineNumber: 51,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                    lineNumber: 45,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                lineNumber: 40,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "w-72 bg-white border-r p-4 flex flex-col min-h-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between mb-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-lg font-semibold text-black",
                        children: "My Papers"
                    }, void 0, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "p-1 rounded hover:bg-gray-100",
                        title: "Collapse",
                        onClick: ()=>setCollapsed(true),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            className: "w-5 h-5 text-neutral-900",
                            viewBox: "0 0 24 24",
                            fill: "none",
                            stroke: "currentColor",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: "2",
                                d: "M9 5l7 7-7 7"
                            }, void 0, false, {
                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                lineNumber: 78,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                            lineNumber: 72,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-gray-500 mb-2",
                children: "Select papers to include in chat (RAG)"
            }, void 0, false, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2 overflow-auto min-h-0 py-2",
                children: [
                    library.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-sm text-gray-500",
                        children: "No papers found"
                    }, void 0, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                        lineNumber: 92,
                        columnNumber: 11
                    }, this),
                    library.map((it)=>{
                        const title = it.metadata?.title || it.metadata?.arxiv_id || it.id;
                        const checked = selectedDocs.has(it.id);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "flex text-black items-start space-x-2 rounded hover:bg-gray-50 p-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "checkbox",
                                    checked: checked,
                                    onChange: (e)=>onToggleSelect(it.id, e.target.checked),
                                    className: "mt-1"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                    lineNumber: 102,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-medium",
                                            children: title
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                            lineNumber: 109,
                                            columnNumber: 17
                                        }, this),
                                        it.metadata?.authors && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-gray-500",
                                            children: formatAuthors(it.metadata.authors)
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                            lineNumber: 111,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                    lineNumber: 108,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    title: "Delete paper",
                                    className: "p-1 text-neutral-900 hover:text-neutral-800",
                                    onClick: (e)=>{
                                        e.preventDefault();
                                        onDelete(it.id);
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        viewBox: "0 0 24 24",
                                        fill: "currentColor",
                                        className: "w-5 h-5 text-neutral-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M9 3a1 1 0 0 0-1 1v1H5.5a.75.75 0 0 0 0 1.5h13a.75.75 0 0 0 0-1.5H16V4a1 1 0 0 0-1-1H9Zm-2 6.25a.75.75 0 0 1 1.5 0v8a.75.75 0 0 1-1.5 0v-8Zm4.75-.75a.75.75 0 0 0-.75.75v8a.75.75 0 0 0 1.5 0v-8a.75.75 0 0 0-.75-.75Zm3.25.75a.75.75 0 0 1 1.5 0v8a.75.75 0 0 1-1.5 0v-8Z"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                                lineNumber: 131,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M5.75 7.5a.75.75 0 0 0-.75.75v9A2.75 2.75 0 0 0 7.75 20h8.5A2.75 2.75 0 0 0 19 17.25v-9a.75.75 0 0 0-.75-.75h-12.5Z"
                                            }, void 0, false, {
                                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                                lineNumber: 132,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                        lineNumber: 125,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                                    lineNumber: 116,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, it.id, true, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                            lineNumber: 98,
                            columnNumber: 13
                        }, this);
                    })
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx",
        lineNumber: 64,
        columnNumber: 5
    }, this);
}
_s(Sidebar, "IaHwFfvbaw8y79e5do0CzWS1eXc=");
_c = Sidebar;
var _c;
__turbopack_context__.k.register(_c, "Sidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Messages",
    ()=>Messages
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function Messages({ messages, typing, chatRef }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: chatRef,
        id: "chatContainer",
        className: "flex-1 overflow-y-auto min-h-0 bg-transparent",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-3xl mx-auto px-6 py-8 container",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center text-gray-500 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-medium",
                            children: "AI Research Assistant"
                        }, void 0, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs",
                            children: "Ask anything about research papers."
                        }, void 0, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                            lineNumber: 23,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    id: "messagesContainer",
                    className: "space-y-5 mt-6",
                    children: [
                        messages.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: m.sender === "user" ? "flex justify-end" : "flex justify-start",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: m.sender === "user" ? "bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-prose" : m.sender === "system" ? "bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-2xl px-4 py-2 max-w-prose text-center text-sm mx-auto" : "bg-neutral-100 text-neutral-900 rounded-2xl px-4 py-2 max-w-prose whitespace-pre-wrap",
                                    children: m.text
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                                    lineNumber: 33,
                                    columnNumber: 15
                                }, this)
                            }, m.id, false, {
                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                                lineNumber: 27,
                                columnNumber: 13
                            }, this)),
                        typing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            id: "typingIndicator",
                            className: "flex justify-start",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-neutral-100 text-neutral-600 rounded-2xl px-4 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex space-x-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                                            lineNumber: 50,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 bg-neutral-400 rounded-full animate-bounce",
                                            style: {
                                                animationDelay: "0.1s"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                                            lineNumber: 51,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 bg-neutral-400 rounded-full animate-bounce",
                                            style: {
                                                animationDelay: "0.2s"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                                            lineNumber: 55,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                                    lineNumber: 49,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                                lineNumber: 48,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                            lineNumber: 47,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
            lineNumber: 20,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c = Messages;
var _c;
__turbopack_context__.k.register(_c, "Messages");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InputForm",
    ()=>InputForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function InputForm({ active, input, setInput, onFeature, onSubmit }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border-t border-neutral-200 p-4 bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                id: "chatForm",
                onSubmit: onSubmit,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3 max-w-3xl mx-auto container",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex space-x-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    id: "searchBtn",
                                    className: "p-2 rounded-md hover:bg-neutral-100 transition-colors",
                                    title: "Search Papers",
                                    onClick: ()=>onFeature("search", "Search Papers"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5 text-neutral-600",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: "2",
                                            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                            lineNumber: 36,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                        lineNumber: 30,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                    lineNumber: 23,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    id: "papersBtn",
                                    className: "p-2 rounded-md hover:bg-neutral-100 transition-colors",
                                    title: "My Papers",
                                    onClick: ()=>onFeature("papers", "My Papers"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5 text-neutral-600",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: "2",
                                            d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                            lineNumber: 57,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                        lineNumber: 51,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                    lineNumber: 44,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    id: "analyzeBtn",
                                    className: "p-2 rounded-md hover:bg-neutral-100 transition-colors",
                                    title: "Compare & Analyze",
                                    onClick: ()=>onFeature("analyze", "Compare & Analyze"),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        className: "w-5 h-5 text-neutral-600",
                                        fill: "none",
                                        stroke: "currentColor",
                                        viewBox: "0 0 24 24",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round",
                                            strokeWidth: "2",
                                            d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                            lineNumber: 78,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                        lineNumber: 72,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                                    lineNumber: 65,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                            lineNumber: 22,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            id: "messageInput",
                            value: input,
                            onChange: (e)=>setInput(e.target.value),
                            placeholder: active ? `Ask about ${active === "search" ? "Search Papers" : active === "papers" ? "My Papers" : "Compare & Analyze"}...` : "Type your message here...",
                            className: "flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-500 text-neutral-900",
                            required: true
                        }, void 0, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            className: "bg-neutral-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-colors font-semibold",
                            children: "Send"
                        }, void 0, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                    lineNumber: 21,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-center text-[11px] text-neutral-400 mt-2",
                children: "Click feature icons to set context."
            }, void 0, false, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c = InputForm;
var _c;
__turbopack_context__.k.register(_c, "InputForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PdfViewer",
    ()=>PdfViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function PdfViewer({ selectedIds, library }) {
    _s();
    const tabs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PdfViewer.useMemo[tabs]": ()=>{
            const set = new Set(selectedIds);
            return library.filter({
                "PdfViewer.useMemo[tabs]": (l)=>set.has(l.id)
            }["PdfViewer.useMemo[tabs]"]);
        }
    }["PdfViewer.useMemo[tabs]"], [
        selectedIds,
        library
    ]);
    const [activeId, setActiveId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(tabs[0]?.id ?? null);
    const resolvedActiveId = tabs.some((t)=>t.id === activeId) ? activeId : tabs[0]?.id ?? null;
    if (tabs.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
            className: "w-full min-w-0 bg-white p-4 overflow-y-auto min-h-0",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm text-neutral-500 text-center py-8 container",
                children: "Select papers to preview PDFs"
            }, void 0, false, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this);
    }
    const active = tabs.find((t)=>t.id === resolvedActiveId) ?? tabs[0];
    const pdfUrl = active?.metadata?.pdf_url;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "w-full min-w-0 bg-white flex flex-col min-h-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex border-b overflow-x-auto",
                children: tabs.map((t)=>{
                    const title = t.metadata?.title || t.metadata?.arxiv_id || t.id;
                    const isActive = t.id === (active?.id ?? tabs[0]?.id);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: `px-3 py-2 text-sm whitespace-nowrap ${isActive ? "border-b-2 border-neutral-900 text-neutral-900" : "text-neutral-600 hover:text-neutral-800"}`,
                        onClick: ()=>setActiveId(t.id),
                        title: title,
                        children: title.length > 24 ? `${title.slice(0, 24)}…` : title
                    }, t.id, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
                        lineNumber: 42,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-h-0 overflow-auto p-4 container",
                children: pdfUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                    src: pdfUrl,
                    className: "w-full h-full rounded-md",
                    title: "PDF Preview"
                }, void 0, false, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
                    lineNumber: 59,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 text-sm text-neutral-500 text-center",
                    children: "No PDF URL available."
                }, void 0, false, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
                    lineNumber: 65,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_s(PdfViewer, "v9AELw/Fx955M1Rui7EIX6cyiDM=");
_c = PdfViewer;
var _c;
__turbopack_context__.k.register(_c, "PdfViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ChatPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$Messages$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/Messages.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$InputForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/InputForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$PdfViewer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/components/chat/PdfViewer.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
function ChatPage() {
    _s();
    // Split ratio for chat/pdf (0..1). Sidebar stays auto.
    // Use a fixed SSR-safe initial value to avoid hydration mismatch; load stored value after mount.
    const [split, setSplit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0.5);
    const splitRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(split);
    const handleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            const v = window.localStorage.getItem("chat_pdf_split");
            const n = v ? Number(v) : NaN;
            if (isFinite(n) && n >= 0.2 && n <= 0.8) {
                setSplit(n);
                splitRef.current = n;
            }
        }
    }["ChatPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            splitRef.current = split;
        }
    }["ChatPage.useEffect"], [
        split
    ]);
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [typing, setTyping] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            id: "intro",
            text: "Hello! I'm your AI research assistant powered by Gemini. How can I help you today?",
            sender: "ai"
        }
    ]);
    const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [library, setLibrary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedDocs, setSelectedDocs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            // fetch user's library
            let mounted = true;
            fetch("/api/library/list").then({
                "ChatPage.useEffect": (r)=>r.json()
            }["ChatPage.useEffect"]).then({
                "ChatPage.useEffect": (data)=>{
                    if (!mounted) return;
                    setLibrary(data.results || []);
                }
            }["ChatPage.useEffect"]).catch({
                "ChatPage.useEffect": ()=>{
                /* ignore */ }
            }["ChatPage.useEffect"]);
            return ({
                "ChatPage.useEffect": ()=>{
                    mounted = false;
                }
            })["ChatPage.useEffect"];
        }
    }["ChatPage.useEffect"], []);
    const addMessage = (text, sender)=>{
        setMessages((m)=>[
                ...m,
                {
                    id: crypto.randomUUID(),
                    text,
                    sender
                }
            ]);
        setTimeout(()=>{
            if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
        });
    };
    const onFeature = (f, name)=>{
        setActive(f);
        addMessage(`Switched to ${name} mode. You can now ask questions related to this feature.`, "system");
    };
    const onSubmit = async (e)=>{
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;
        const labels = {
            search: "Search Papers",
            papers: "My Papers",
            analyze: "Compare & Analyze"
        };
        const display = active ? `[${labels[active]}] ${trimmed}` : trimmed;
        addMessage(display, "user");
        setInput("");
        setTyping(true);
        try {
            // Build system instruction based on active feature
            let systemInstruction = "You are a helpful AI assistant for researchers working with computer science papers.";
            if (active === "search") {
                systemInstruction += " You help users discover and search for research papers.";
            } else if (active === "papers") {
                systemInstruction += " You help users manage their paper collections.";
            } else if (active === "analyze") {
                systemInstruction += " You help users compare and analyze research papers.";
            }
            // include selected doc ids for RAG
            const docs = Array.from(selectedDocs.values());
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    prompt: trimmed,
                    system: systemInstruction,
                    temperature: 0.7,
                    doc_ids: docs
                })
            });
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({
                        error: "Unknown error"
                    }));
                throw new Error(errorData.error || "Failed to get response");
            }
            const data = await response.json();
            const aiResponse = data.content || "Sorry, I couldn't generate a response.";
            setTyping(false);
            addMessage(aiResponse, "ai");
        } catch (error) {
            setTyping(false);
            addMessage(`Error: ${error instanceof Error ? error.message : "Failed to get AI response"}`, "system");
        }
    };
    // Compute Navbar height at runtime so the chat area can exactly fill the
    // remaining viewport. Also disable body scrolling while this page is active
    // so the visible area (navbar + chat) never causes a window scrollbar.
    const [navHeight, setNavHeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(64);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatPage.useEffect": ()=>{
            const update = {
                "ChatPage.useEffect.update": ()=>{
                    const nav = document.querySelector("nav");
                    const h = nav ? Math.round(nav.getBoundingClientRect().height) : 64;
                    setNavHeight(h);
                }
            }["ChatPage.useEffect.update"];
            // compute once and also on resize
            update();
            window.addEventListener("resize", update);
            // Prevent the document from scrolling while on the chat page. Save
            // previous overflow and restore on unmount.
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return ({
                "ChatPage.useEffect": ()=>{
                    window.removeEventListener("resize", update);
                    document.body.style.overflow = prev || "";
                }
            })["ChatPage.useEffect"];
        }
    }["ChatPage.useEffect"], []);
    const navbarHeight = navHeight; // used below in styles
    const handleWidthPx = 6;
    // 4-column grid: sidebar | chat | handle | pdf
    // use fr units for chat/pdf so they split the remaining space after sidebar correctly
    const gridTemplate = `auto ${split}fr ${handleWidthPx}px ${1 - split}fr`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-screen flex flex-col bg-white overflow-hidden",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-w-0 min-h-0",
            style: {
                height: `calc(100vh - ${navbarHeight}px)`,
                overflow: "hidden"
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-full grid gap-0",
                style: {
                    gridTemplateColumns: gridTemplate
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sidebar"], {
                        library: library,
                        selectedDocs: selectedDocs,
                        onToggleSelect: (id, checked)=>{
                            setSelectedDocs((s)=>{
                                const copy = new Set(s);
                                if (checked) copy.add(id);
                                else copy.delete(id);
                                return copy;
                            });
                        },
                        onDelete: async (id)=>{
                            const item = library.find((x)=>x.id === id);
                            const title = item?.metadata?.title || item?.metadata?.arxiv_id || id;
                            try {
                                const res = await fetch(`/api/library/delete?id=${encodeURIComponent(id)}`, {
                                    method: "DELETE"
                                });
                                if (!res.ok) {
                                    const err = await res.json().catch(()=>({}));
                                    addMessage(`Error deleting ${title}: ${err.error || res.statusText}`, "system");
                                    return;
                                }
                                setLibrary((prev)=>prev.filter((x)=>x.id !== id));
                                setSelectedDocs((s)=>{
                                    const copy = new Set(s);
                                    copy.delete(id);
                                    return copy;
                                });
                            } catch (err) {
                                const msg = err instanceof Error ? err.message : "Unknown error";
                                addMessage(`Error deleting ${title}: ${msg}`, "system");
                            }
                        }
                    }, void 0, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
                        lineNumber: 187,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 flex flex-col min-w-0 min-h-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$Messages$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Messages"], {
                                messages: messages,
                                typing: typing,
                                chatRef: chatRef
                            }, void 0, false, {
                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$InputForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InputForm"], {
                                active: active,
                                input: input,
                                setInput: setInput,
                                onFeature: onFeature,
                                onSubmit: onSubmit
                            }, void 0, false, {
                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
                                lineNumber: 233,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
                        lineNumber: 231,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: handleRef,
                        className: "h-full cursor-col-resize bg-neutral-200 hover:bg-neutral-300 transition-colors",
                        onMouseDown: (e)=>{
                            e.preventDefault();
                            const startX = e.clientX;
                            const container = handleRef.current?.parentElement;
                            if (!container) return;
                            const rect = container.getBoundingClientRect();
                            // subtract sidebar width and handle width to get adjustable area
                            const sidebarEl = container.children[0];
                            const sidebarWidth = sidebarEl ? sidebarEl.getBoundingClientRect().width : 0;
                            const available = rect.width - sidebarWidth - handleWidthPx;
                            const startChatWidth = splitRef.current * available;
                            // prevent text selection while dragging
                            const prevUserSelect = document.body.style.userSelect;
                            document.body.style.userSelect = "none";
                            const onMove = (ev)=>{
                                const delta = ev.clientX - startX;
                                const newChatWidth = startChatWidth + delta;
                                let next = newChatWidth / Math.max(1, available);
                                next = Math.max(0.2, Math.min(0.8, next));
                                if (next !== splitRef.current) {
                                    splitRef.current = next;
                                    setSplit(next);
                                }
                            };
                            const onUp = ()=>{
                                window.removeEventListener("mousemove", onMove);
                                window.removeEventListener("mouseup", onUp);
                                try {
                                    window.localStorage.setItem("chat_pdf_split", String(splitRef.current));
                                } catch  {}
                                // restore user select
                                document.body.style.userSelect = prevUserSelect || "";
                            };
                            window.addEventListener("mousemove", onMove);
                            window.addEventListener("mouseup", onUp);
                        }
                    }, void 0, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
                        lineNumber: 242,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$components$2f$chat$2f$PdfViewer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PdfViewer"], {
                        selectedIds: Array.from(selectedDocs),
                        library: library
                    }, void 0, false, {
                        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
                        lineNumber: 292,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
                lineNumber: 183,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
            lineNumber: 176,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/chat/page.tsx",
        lineNumber: 175,
        columnNumber: 5
    }, this);
}
_s(ChatPage, "0F0DghaWkoIC+r/cji88jkfY7Xc=");
_c = ChatPage;
var _c;
__turbopack_context__.k.register(_c, "ChatPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Documents_VSCode%20work_capstone_CSE5914_frontend_27674020._.js.map