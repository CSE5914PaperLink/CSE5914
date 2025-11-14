(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LibraryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/VSCode work/capstone/CSE5914/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function LibraryPage() {
    _s();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchItems = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/library/list");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load library");
            setItems(data.results || []);
        } catch (e) {
            setError(e.message);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LibraryPage.useEffect": ()=>{
            fetchItems();
        }
    }["LibraryPage.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-gray-50 min-h-screen",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-6 py-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-8 flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold text-gray-900 mb-2",
                                    children: "Library"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                    lineNumber: 42,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-600",
                                    children: "Your ingested arXiv papers"
                                }, void 0, false, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                    lineNumber: 43,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: fetchItems,
                            className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg",
                            disabled: loading,
                            children: loading ? "Refreshing..." : "Refresh"
                        }, void 0, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                    lineNumber: 40,
                    columnNumber: 9
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                    lineNumber: 54,
                    columnNumber: 11
                }, this),
                items.length === 0 && !loading && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-12 text-gray-500",
                    children: "No papers added yet."
                }, void 0, false, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                    lineNumber: 59,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-white rounded-lg shadow p-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-semibold text-gray-900 mb-2",
                                            children: item.metadata.title || item.metadata.arxiv_id || item.id
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                            lineNumber: 68,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600 mb-2",
                                            children: item.metadata.authors || item.metadata.author || item.metadata.arxiv_id
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                            lineNumber: 71,
                                            columnNumber: 19
                                        }, this),
                                        item.document && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-gray-700 text-sm whitespace-pre-line",
                                            children: item.document
                                        }, void 0, false, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                            lineNumber: 77,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-2 text-xs text-gray-500 flex flex-wrap gap-3",
                                            children: [
                                                item.metadata.arxiv_id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "🆔 ",
                                                        item.metadata.arxiv_id
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                                    lineNumber: 83,
                                                    columnNumber: 23
                                                }, this),
                                                item.metadata.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$VSCode__work$2f$capstone$2f$CSE5914$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        "📝 ",
                                                        item.metadata.length,
                                                        " chars"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                                    lineNumber: 86,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                            lineNumber: 81,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                    lineNumber: 67,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                                lineNumber: 66,
                                columnNumber: 15
                            }, this)
                        }, item.id, false, {
                            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
            lineNumber: 39,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/VSCode work/capstone/CSE5914/frontend/app/library/page.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_s(LibraryPage, "zCJEZ8SYbCC0YUftRRhdXmwzfno=");
_c = LibraryPage;
var _c;
__turbopack_context__.k.register(_c, "LibraryPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Documents_VSCode%20work_capstone_CSE5914_frontend_app_library_page_tsx_dc6c2207._.js.map