import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { IconChevronDown, IconExternal, IconFunnel } from './icons.jsx'
import { DateRangePicker } from './DateRangePicker.jsx'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Label, ComposedChart, Line, LabelList
} from 'recharts'
import { useNavigate } from "react-router-dom";


const threatCategories = [
    { category: 'Fake Social Media Handles', count: 294 },
    { category: 'Fake Customer Care No', count: 24 },
    { category: 'Sponsored Ads', count: 10 },
    { category: 'Fake Website/Similar Domain', count: 1 },
    { category: 'Fake Job Promotions', count: 161 },
    { category: 'Fake YouTube Channels', count: 168 },
    { category: 'Fake IM Handles', count: 18 },
    { category: 'Fake App', count: 4 },
    { category: 'Fake Offers', count: 62 },
    { category: 'Fake BS Handles', count: 56 },
]

const regionalSegments = [
    { channel: 'Social Media Platforms', count: 405, percentage: 50.75, color: '#004A50' },
    { channel: 'YouTube', count: 190, percentage: 23.81, color: '#4DA7AE' },
    { channel: 'Messaging Channel Platforms', count: 80, percentage: 10.03, color: '#006068' },
    { channel: 'Bloggingsites', count: 60, percentage: 7.52, color: '#007680' },
    { channel: 'Organic Search', count: 59, percentage: 7.39, color: '#B3DADD' },
    { channel: 'Rogue Apps', count: 4, percentage: 0.5, color: '#80C1C5' },
]

const contactPoints = [
    { publisher: '7669020101', count: 10 },
    { publisher: '9547064828', count: 8 },
    { publisher: '9835935122', count: 4 },
    { publisher: '6291454847', count: 2 },
    { publisher: '7619749005', count: 2 },
    { publisher: '6297250367', count: 2 },
    { publisher: '9521712012', count: 2 },
    { publisher: '8003891492', count: 2 },
    { publisher: '9.71557E+11', count: 2 },
    { publisher: '9910257984', count: 2 },
]

const riskHandles = [
    { channel: 'Air India', count: 52, color: "#3C8F2A" },
    { channel: 'Shivang Amin', count: 22, color: '#86bc25' },
    { channel: 'air india', count: 7, color: '#b5d97a' },
    { channel: 'Air India customer care number //9547064828', count: 7, color: '#7EA760' },
    { channel: 'AIR INDIA', count: 6, color: '#6b8e23' },
    { channel: 'Air India Medical Job', count: 5, color: '#9acd32' },
    { channel: 'Air India', count: 5, color: "#8BB86C" },
    { channel: 'Air IndiaÂ ', count: 5, color: "#B2EB90" },
    { channel: 'Air India Express', count: 4, color: "#57743C" },
    { channel: 'Air India Roblox', count: 3, color: "#BFFC9C" },
]

// const summaryCards = [
//   {
//     label: 'Website/ App',
//     value: 123,
//     pct: '15.41%',
//     iconSrc: '/summary-icons/websites.png',
//     redirectTo: '/web-summary',
//   },
//   {
//     label: 'Social Media',
//     value: 675,
//     pct: '84.59%',
//     iconSrc: '/summary-icons/socialMedia.png',
//     redirectTo: '/web-summary',
//   },
//   {
//     label: 'Customer care',
//     value: 24,
//     pct: '3.01%',
//     iconSrc: '/summary-icons/customerCare.png',
//     redirectTo: '/web-summary',
//   },
//   {
//     label: 'Job Promotions',
//     value: 161,
//     pct: '20.18%',
//     iconSrc: '/summary-icons/jobPromotions.png',
//     redirectTo: '/web-summary',
//   },
//   {
//     label: 'Offers',
//     value: 62,
//     pct: '7.77%',
//     iconSrc: '/summary-icons/offers.png',
//     redirectTo: '/web-summary',
//   },
//   {
//     label: 'Sponsored Ads',
//     value: 10,
//     pct: '1.25%',
//     iconSrc: '/summary-icons/ads.png',
//     redirectTo: '/web-summary',
//   },
// ]


const summaryCards = [
    {
        label: 'Suspicious Website / App',
        value: 123,
        pct: 15.41,
        // iconSrc: `${process.env.PUBLIC_URL}/summary-icons/websites.png`,
        iconSrc: `${import.meta.env.BASE_URL}/summary-icons/websites.png`,
        redirectTo: '/web-summary',
        accent: '#D85A30',
        ringBg: 'rgba(216,90,48,0.12)',
    },
    {
        label: 'Suspicious Social Media Handles',
        value: 675,
        pct: 84.59,
        iconSrc: `${import.meta.env.BASE_URL}/summary-icons/socialMedia.png`,
        redirectTo: '/web-summary',
        accent: '#378ADD',
        ringBg: 'rgba(55,138,221,0.12)',
    },
    {
        label: 'Suspicious Customer Care Numbers',
        value: 24,
        pct: 3.01,
        iconSrc: `${import.meta.env.BASE_URL}/summary-icons/customerCare.png`,
        redirectTo: '/web-summary',
        accent: '#cf7759',
       ringBg: 'rgba(207,119,89,0.12)'
    },
    {
        label: 'Suspicious Job Promotions',
        value: 161,
        pct: 20.18,
        iconSrc: `${import.meta.env.BASE_URL}/summary-icons/jobPromotions.png`,
        redirectTo: '/web-summary',
        accent: '#BA7517',
        ringBg: 'rgba(186,117,23,0.12)',
    },
    {
        label: 'Suspicious Offers',
        value: 62,
        pct: 7.77,
        iconSrc: `${import.meta.env.BASE_URL}/summary-icons/offers.png`,
        redirectTo: '/web-summary',
        accent: '#1D9E75',
        ringBg: 'rgba(29,158,117,0.12)',
    },
    {
        label: 'Suspicious Sponsored Ads',
        value: 10,
        pct: 1.25,
        iconSrc: `${import.meta.env.BASE_URL}/summary-icons/ads.png`,
        redirectTo: '/web-summary',
        accent: '#534AB7',
        ringBg: 'rgba(83,74,183,0.12)',
    },
]


const rawIncidentData = [
    { inserted_date: '27-02-2026', total: 798, active: 798, in_progress: 0, closed: 0 },
]

// const Platforms = [
//   { Platform: 'YouTube Videos', count: 190, percentage: 23.81 },
//   { Platform: 'Facebook', count: 126, percentage: 15.79 },
//   { Platform: 'Instagram', count: 110, percentage: 13.78 },
//   { Platform: 'X', count: 86, percentage: 10.78 },
//   { Platform: 'Pinterest', count: 83, percentage: 10.4 },
//   { Platform: 'Telegram', count: 79, percentage: 9.9 },
//   { Platform: 'Quora', count: 45, percentage: 5.64 },
//   { Platform: 'Bebee', count: 34, percentage: 4.26 },
//   { Platform: 'Kit Job', count: 24, percentage: 3.01 },
//   { Platform: 'Reddit', count: 15, percentage: 1.88 },
//   { Platform: 'App Store', count: 4, percentage: 0.5 },
//   { Platform: 'Web Page', count: 1, percentage: 0.13 },
//   { Platform: 'Whatsapp', count: 1, percentage: 0.13 },
// ]
const platformVolumeData = {
  All: [
    { inserted_date: "21-02-2026", total: 109, active: 40, in_progress: 39, closed: 30 },
    { inserted_date: "22-02-2026", total: 116, active: 36, in_progress: 40, closed: 40 },
    { inserted_date: "23-02-2026", total: 113, active: 43, in_progress: 40, closed: 30 },
    { inserted_date: "24-02-2026", total: 109, active: 50, in_progress: 29, closed: 30 },
    { inserted_date: "25-02-2026", total: 117, active: 67, in_progress: 26, closed: 24 },
    { inserted_date: "26-02-2026", total: 118, active: 68, in_progress: 25, closed: 25 },
    { inserted_date: "27-02-2026", total: 116, active: 60, in_progress: 36, closed: 20 },
    ], // 798
 "YouTube Videos": [
  { inserted_date: "21-02-2026", total: 25, active: 13, in_progress: 7, closed: 5 },
  { inserted_date: "22-02-2026", total: 30, active: 15, in_progress: 9, closed: 6 },
  { inserted_date: "23-02-2026", total: 28, active: 14, in_progress: 8, closed: 6 },
  { inserted_date: "24-02-2026", total: 22, active: 13, in_progress: 4, closed: 5 },
  { inserted_date: "25-02-2026", total: 29, active: 15, in_progress: 8, closed: 6 },
  { inserted_date: "26-02-2026", total: 26, active: 13, in_progress: 8, closed: 5 },
  { inserted_date: "27-02-2026", total: 30, active: 13, in_progress: 12, closed: 5 },
],

Facebook: [
  { inserted_date: "21-02-2026", total: 18, active: 9, in_progress: 5, closed: 4 },
  { inserted_date: "22-02-2026", total: 17, active: 8, in_progress: 5, closed: 4 },
  { inserted_date: "23-02-2026", total: 19, active: 10, in_progress: 5, closed: 4 },
  { inserted_date: "24-02-2026", total: 16, active: 8, in_progress: 5, closed: 3 },
  { inserted_date: "25-02-2026", total: 20, active: 10, in_progress: 6, closed: 4 },
  { inserted_date: "26-02-2026", total: 18, active: 9, in_progress: 5, closed: 4 },
  { inserted_date: "27-02-2026", total: 18, active: 9, in_progress: 5, closed: 4 },
],

Instagram: [
  { inserted_date: "21-02-2026", total: 15, active: 8, in_progress: 4, closed: 3 },
  { inserted_date: "22-02-2026", total: 16, active: 8, in_progress: 5, closed: 3 },
  { inserted_date: "23-02-2026", total: 14, active: 7, in_progress: 4, closed: 3 },
  { inserted_date: "24-02-2026", total: 17, active: 8, in_progress: 5, closed: 4 },
  { inserted_date: "25-02-2026", total: 15, active: 8, in_progress: 4, closed: 3 },
  { inserted_date: "26-02-2026", total: 18, active: 9, in_progress: 5, closed: 4 },
  { inserted_date: "27-02-2026", total: 15, active: 8, in_progress: 4, closed: 3 },
],

Twitter: [
  { inserted_date: "21-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
  { inserted_date: "22-02-2026", total: 13, active: 7, in_progress: 4, closed: 2 },
  { inserted_date: "23-02-2026", total: 11, active: 6, in_progress: 3, closed: 2 },
  { inserted_date: "24-02-2026", total: 14, active: 7, in_progress: 4, closed: 3 },
  { inserted_date: "25-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
  { inserted_date: "26-02-2026", total: 13, active: 7, in_progress: 4, closed: 2 },
  { inserted_date: "27-02-2026", total: 11, active: 6, in_progress: 3, closed: 2 },
],

Pinterest: [
  { inserted_date: "21-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
  { inserted_date: "22-02-2026", total: 11, active: 6, in_progress: 3, closed: 2 },
  { inserted_date: "23-02-2026", total: 13, active: 7, in_progress: 4, closed: 2 },
  { inserted_date: "24-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
  { inserted_date: "25-02-2026", total: 11, active: 6, in_progress: 3, closed: 2 },
  { inserted_date: "26-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
  { inserted_date: "27-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
], // 83

Telegram: [
  { inserted_date: "21-02-2026", total: 10, active: 5, in_progress: 3, closed: 2 },
  { inserted_date: "22-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
  { inserted_date: "23-02-2026", total: 11, active: 6, in_progress: 3, closed: 2 },
  { inserted_date: "24-02-2026", total: 9, active: 5, in_progress: 3, closed: 1 },
  { inserted_date: "25-02-2026", total: 13, active: 7, in_progress: 4, closed: 2 },
  { inserted_date: "26-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
  { inserted_date: "27-02-2026", total: 12, active: 6, in_progress: 4, closed: 2 },
], // 79

Quora: [
  { inserted_date: "21-02-2026", total: 6, active: 3, in_progress: 2, closed: 1 },
  { inserted_date: "22-02-2026", total: 7, active: 4, in_progress: 2, closed: 1 },
  { inserted_date: "23-02-2026", total: 6, active: 3, in_progress: 2, closed: 1 },
  { inserted_date: "24-02-2026", total: 7, active: 4, in_progress: 2, closed: 1 },
  { inserted_date: "25-02-2026", total: 6, active: 3, in_progress: 2, closed: 1 },
  { inserted_date: "26-02-2026", total: 7, active: 4, in_progress: 2, closed: 1 },
  { inserted_date: "27-02-2026", total: 6, active: 3, in_progress: 2, closed: 1 },
], // 45

Bebee: [
  { inserted_date: "21-02-2026", total: 5, active: 3, in_progress: 1, closed: 1 },
  { inserted_date: "22-02-2026", total: 4, active: 2, in_progress: 1, closed: 1 },
  { inserted_date: "23-02-2026", total: 5, active: 3, in_progress: 1, closed: 1 },
  { inserted_date: "24-02-2026", total: 5, active: 3, in_progress: 1, closed: 1 },
  { inserted_date: "25-02-2026", total: 5, active: 3, in_progress: 1, closed: 1 },
  { inserted_date: "26-02-2026", total: 5, active: 3, in_progress: 1, closed: 1 },
  { inserted_date: "27-02-2026", total: 5, active: 3, in_progress: 1, closed: 1 },
], // 34

"Kit Job": [
  { inserted_date: "21-02-2026", total: 3, active: 1, in_progress: 1, closed: 1 },
  { inserted_date: "22-02-2026", total: 4, active: 2, in_progress: 1, closed: 1 },
  { inserted_date: "23-02-2026", total: 3, active: 1, in_progress: 1, closed: 1 },
  { inserted_date: "24-02-2026", total: 4, active: 2, in_progress: 1, closed: 1 },
  { inserted_date: "25-02-2026", total: 3, active: 1, in_progress: 1, closed: 1 },
  { inserted_date: "26-02-2026", total: 4, active: 2, in_progress: 1, closed: 1 },
  { inserted_date: "27-02-2026", total: 3, active: 1, in_progress: 1, closed: 1 },
], // 24

Reddit: [
  { inserted_date: "21-02-2026", total: 2, active: 1, in_progress: 1, closed: 0 },
  { inserted_date: "22-02-2026", total: 2, active: 1, in_progress: 1, closed: 0 },
  { inserted_date: "23-02-2026", total: 3, active: 1, in_progress: 1, closed: 1 },
  { inserted_date: "24-02-2026", total: 2, active: 1, in_progress: 1, closed: 0 },
  { inserted_date: "25-02-2026", total: 2, active: 1, in_progress: 1, closed: 0 },
  { inserted_date: "26-02-2026", total: 2, active: 1, in_progress: 1, closed: 0 },
  { inserted_date: "27-02-2026", total: 2, active: 1, in_progress: 1, closed: 0 },
], // 15

"App Store": [
  { inserted_date: "21-02-2026", total: 1, active: 1, in_progress: 0, closed: 0 },
  { inserted_date: "24-02-2026", total: 1, active: 1, in_progress: 0, closed: 0 },
  { inserted_date: "27-02-2026", total: 2, active: 1, in_progress: 1, closed: 0 },
], // 4

"Web Page": [
  { inserted_date: "25-02-2026", total: 1, active: 1, in_progress: 0, closed: 0 },
], // 1

Whatsapp: [
  { inserted_date: "26-02-2026", total: 1, active: 1, in_progress: 0, closed: 0 },
], // 1
};

const Platforms = [
    { Platform: 'YouTube Videos', count: 190, percentage: 23.81, logo: `${import.meta.env.BASE_URL}/channel-logos/Youtube.png` },
    { Platform: 'Facebook', count: 126, percentage: 15.79, logo: `${import.meta.env.BASE_URL}/channel-logos/Facebook.png` },
    { Platform: 'Instagram', count: 110, percentage: 13.78, logo: `${import.meta.env.BASE_URL}/channel-logos/Insta.png` },
    { Platform: 'Twitter', count: 86, percentage: 10.78, logo: `${import.meta.env.BASE_URL}/channel-logos/X.png` },
    { Platform: 'Pinterest', count: 83, percentage: 10.4, logo: `${import.meta.env.BASE_URL}/channel-logos/Pinterest.png` },
    { Platform: 'Telegram', count: 79, percentage: 9.9, logo: `${import.meta.env.BASE_URL}/channel-logos/Telegram.png` },
    { Platform: 'Quora', count: 45, percentage: 5.64, logo: `${import.meta.env.BASE_URL}/channel-logos/Quora.png` },
    { Platform: 'Bebee', count: 34, percentage: 4.26, logo: `${import.meta.env.BASE_URL}/channel-logos/Bebee.png` },
    { Platform: 'Kit Job', count: 24, percentage: 3.01, logo: `${import.meta.env.BASE_URL}/channel-logos/KitJob.png` },
    { Platform: 'Reddit', count: 15, percentage: 1.88, logo: `${import.meta.env.BASE_URL}/channel-logos/Reddit.png` },
    { Platform: 'App Store', count: 4, percentage: 0.5, logo: `${import.meta.env.BASE_URL}/channel-logos/AppStore.png` },
    { Platform: 'Web Page', count: 1, percentage: 0.13, logo: `${import.meta.env.BASE_URL}/channel-logos/WebPage.png` },
    { Platform: 'Whatsapp', count: 1, percentage: 0.13, logo: `${import.meta.env.BASE_URL}/channel-logos/Whatsapp.png` },
]

// ─── Aggregation helper ───────────────────────────────────────────────────────

function aggregateData(data, range) {
    const toEntry = (date, v) => ({
        date,
        incidentsReported: v.total,
        underBrandReview: v.active,
        takedownInitiated: v.in_progress,
        closedIncidents: v.closed,
    })
    if (range === 'daily') return data.map((row) => toEntry(row.inserted_date, row))
    if (range === 'weekly') {
        const weeks = {}
        data.forEach((row) => {
            const [dd, mm, yyyy] = row.inserted_date.split('-')
            const d = new Date(`${yyyy}-${mm}-${dd}`)
            const day = d.getDay()
            const monday = new Date(d)
            monday.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const key =
            `${monday.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
            })} - ${sunday.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
            })}`;
            if (!weeks[key]) weeks[key] = { total: 0, active: 0, in_progress: 0, closed: 0 }
            weeks[key].total += row.total; weeks[key].active += row.active
            weeks[key].in_progress += row.in_progress; weeks[key].closed += row.closed
        })
        return Object.entries(weeks).map(([date, v]) => toEntry(date, v))
    }
    if (range === 'monthly') {
        const months = {}
        data.forEach((row) => {
            const [, mm, yyyy] = row.inserted_date.split('-')
            const key = new Date(`${yyyy}-${mm}-01`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
            if (!months[key]) months[key] = { total: 0, active: 0, in_progress: 0, closed: 0 }
            months[key].total += row.total; months[key].active += row.active
            months[key].in_progress += row.in_progress; months[key].closed += row.closed
        })
        return Object.entries(months).map(([date, v]) => toEntry(date, v))
    }
    return []
}


function exportCSV(data, filename) {
    if (!data?.length) return
    const headers = Object.keys(data[0])
    const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${filename}.csv`; a.click()
    URL.revokeObjectURL(url)
}

function exportPNG(containerRef, filename) {
    const node = containerRef?.current
    if (!node) return

    const doExport = () => {
        window.htmlToImage
            .toPng(node, {
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                skipFonts: false,
            })
            .then((dataUrl) => {
                const a = document.createElement('a')
                a.href = dataUrl
                a.download = `${filename}.png`
                a.click()
            })
            .catch((err) => console.error('Export failed:', err))
    }

    if (window.htmlToImage) {
        doExport()
    } else {
        const existing = document.getElementById('htmltoimage-script')
        if (existing) {
            existing.addEventListener('load', doExport)
            return
        }
        const script = document.createElement('script')
        script.id = 'htmltoimage-script'
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.js'
        script.onload = doExport
        script.onerror = () => console.error('Failed to load html-to-image')
        document.head.appendChild(script)
    }
}


function ExpandModal({ title, onClose, children }) {
    useEffect(() => {
        function handler(e) { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col  border border-neutral-200 bg-white shadow-2xl">
                {/* Modal header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
                    <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-8 items-center justify-center   text-neutral-500 hover:bg-neutral-100"
                    >
                        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                {/* Modal body — children re-rendered at larger size */}
                <div className="flex-1 overflow-auto p-6">{children}</div>
            </div>
        </div>
    )
}


function ChartMenu({ title, csvData, chartRef, onExpand }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const menuItems = [
        {
            label: 'Export to CSV',
            icon: (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            ),
            action: () => { exportCSV(csvData, title); setOpen(false) },
        },
        {
            label: 'Export to PNG',
            icon: (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            ),
            action: () => { exportPNG(chartRef, title); setOpen(false) },
        },
        {
            label: 'Expand',
            icon: (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                </svg>
            ),
            action: () => { onExpand(); setOpen(false) },
        },
    ]

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex size-8 items-center justify-center   border border-neutral-300 bg-white text-neutral-500 hover:border-neutral-400 hover:bg-neutral-50"
            >
                <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full z-20 mt-1 w-44   border border-neutral-200 bg-white py-1 shadow-lg">
                    {menuItems.map(({ label, icon, action }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={action}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                        >
                            <span className="text-neutral-500">{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}


const LEGEND_ITEMS = [
    { key: 'incidentsReported', label: 'Incidents Reported', color: '#007680' },
    { key: 'underBrandReview', label: 'Under Brand Review', color: '#62B5E5' },
    { key: 'takedownInitiated', label: 'Takedown Initiated', color: '#ED8B00' },
    { key: 'closedIncidents', label: 'Closed Incidents', color: '#FFCD00' },
]

function VolumeTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div className="min-w-[200px]   border border-neutral-200 bg-white p-3 text-sm shadow-md">
            <p className="mb-2 font-bold text-neutral-900">{label}</p>
            {LEGEND_ITEMS.map(({ key, label: name, color }) => {
                const val = payload.find((p) => p.dataKey === key)?.value ?? 0
                return (
                    <div key={key} className="flex items-center justify-between gap-6 py-0.5">
                        <span className="flex items-center gap-1.5">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-neutral-600">{name}</span>
                        </span>
                        <span className="tabular-nums font-medium text-neutral-900">{val}</span>
                    </div>
                )
            })}
        </div>
    )
}

function VolumeLegend() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3 text-xs text-neutral-600">
            {LEGEND_ITEMS.map(({ key, label, color }) => (
                <span key={key} className="flex items-center gap-1.5">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                </span>
            ))}
        </div>
    )
}


function FilterButton({ label, options }) {
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState([])
    const [search, setSearch] = useState('')
    const ref = useRef(null)

    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    const allSelected = filtered.length > 0 && filtered.every((o) => selected.includes(o))
    const noneSelected = selected.length === 0

    function toggleAll() {
        if (allSelected) {
            setSelected((prev) => prev.filter((o) => !filtered.includes(o)))
        } else {
            setSelected((prev) => [...new Set([...prev, ...filtered])])
        }
    }

    function toggle(opt) {
        setSelected((prev) =>
            prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
        )
    }

    function handleOpenToggle() {
        setOpen((o) => !o)
        if (!open) setSearch('') // reset search when opening
    }

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={handleOpenToggle}
                className="inline-flex items-center gap-2   border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:border-neutral-400"
            >
                <IconFunnel className="size-4 text-neutral-500" />
                {label}
                {selected.length > 0 && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
                        {selected.length}
                    </span>
                )}
                <IconChevronDown className={`size-4 text-neutral-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-20 mt-1 w-56   border border-neutral-200 bg-white shadow-lg">

                    {/* Search input */}
                    <div className="border-b border-neutral-100 px-2 py-2">
                        <div className="flex items-center gap-2 border border-neutral-200 bg-neutral-50 px-2.5 py-1.5">
                            <svg className="size-3.5 shrink-0 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={`Search ${label.toLowerCase()}…`}
                                className="w-full bg-transparent text-xs text-neutral-700 placeholder-neutral-400 outline-none"
                                autoFocus
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="shrink-0 text-neutral-400 hover:text-neutral-600"
                                >
                                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Select all / Clear all */}
                    <div className="flex items-center justify-between px-3 py-1">
                        <button
                            type="button"
                            onClick={toggleAll}
                            className="text-xs font-medium text-brand hover:underline"
                        >
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </button>
                        {!noneSelected && (
                            <button
                                type="button"
                                onClick={() => setSelected([])}
                                className="text-xs font-medium text-neutral-400 hover:text-neutral-600 hover:underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Options list */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filtered.length > 0 ? filtered.map((opt) => {
                            const checked = selected.includes(opt)
                            return (
                                <li key={opt}>
                                    <button
                                        type="button"
                                        onClick={() => toggle(opt)}
                                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                    >
                                        <span className={`flex size-4 shrink-0 items-center justify-center border transition-colors ${checked ? 'border-brand bg-brand' : 'border-neutral-300 bg-white'
                                            }`}>
                                            {checked && (
                                                <svg className="size-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                                    <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </span>
                                        {opt}
                                    </button>
                                </li>
                            )
                        }) : (
                            <li className="px-3 py-4 text-center text-xs text-neutral-400">
                                No results for "{search}"
                            </li>
                        )}
                    </ul>

                    {/* Footer */}
                    {!noneSelected && (
                        <div className="border-t border-neutral-100 px-3 py-2 text-xs text-neutral-500">
                            {selected.length} of {options.length} selected
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// function SummaryCard({ label, value, pct, iconSrc, redirectTo }) {
//   const navigate = useNavigate();
//   return (
//     <div onClick={() => navigate(redirectTo)} className="relative    bg-brand/20 p-4">
//       <button type="button" className="absolute right-3 top-3  p-1 text-neutral-500 hover:bg-white/80 hover:text-neutral-800" aria-label="Open details">
//         <IconExternal className="size-6" />
//       </button>
//       <img src={iconSrc} alt="" className="size-10 object-contain" decoding="async" />
//       <p className="mt-3 text-xs font-medium text-neutral-600">{label}</p>
//       <p className="mt-1 flex items-baseline gap-2">
//         <span className="text-3xl font-bold tabular-nums text-brand">{value}</span>
//         <span className="text-sm text-neutral-500">{pct}</span>
//       </p>
//     </div>
//   )
// }

const RING_R = 26
const RING_CX = 32
const RING_STROKE = 5
const RING_CIRC = 2 * Math.PI * RING_R


function SummaryCard({ label, value, pct, accent, ringBg, redirectTo }) {
    const navigate = useNavigate()

    const dashArr = (pct / 100) * RING_CIRC
    const dashOff = RING_CIRC - dashArr
    const displayPct = pct < 10 ? pct.toFixed(1) : Math.round(pct)

    return (
        <div
            onClick={() => navigate(redirectTo)}
            className="relative flex min-h-[140px] cursor-pointer items-center gap-3 border border-neutral-200 bg-white p-4 transition-all duration-150 hover:border-neutral-400 hover:shadow-sm"
        >
            {/* Ring */}
            <div className="relative shrink-0">
                <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
                    <circle cx={RING_CX} cy={RING_CX} r={RING_R} fill={ringBg} />
                    <circle
                        cx={RING_CX} cy={RING_CX} r={RING_R}
                        fill="none"
                        stroke={accent}
                        strokeOpacity={0.18}
                        strokeWidth={RING_STROKE}
                    />
                    <circle
                        cx={RING_CX} cy={RING_CX} r={RING_R}
                        fill="none"
                        stroke={accent}
                        strokeWidth={RING_STROKE}
                        strokeDasharray={`${dashArr.toFixed(2)} ${dashOff.toFixed(2)}`}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${RING_CX} ${RING_CX})`}
                    />
                </svg>
                {/* % label centered in ring */}
                <div
                    className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums"
                    style={{ color: accent }}
                >
                    {displayPct}%
                </div>
            </div>

            {/* Value + label */}
            <div className="min-w-0 flex-1">
                <p className="text-2xl font-bold tabular-nums leading-none text-neutral-900">{value}</p>
                <p className="mt-1 text-xs font-medium leading-snug text-neutral-500">{label}</p>
            </div>

            <IconExternal className="absolute right-2.5 top-2.5 size-4 text-neutral-300" />
        </div>
    )
}



function StatusCard({ iconSrc, value, label, children }) {
    const hasIcon = Boolean(iconSrc)
    return (
        <div className="flex h-full min-h-0 flex-col items-center justify-center    border border-neutral-200 bg-white p-4 text-center">
            {hasIcon ? <img src={iconSrc} alt="" className="size-6 shrink-0 object-contain" decoding="async" /> : null}
            <p className={`text-3xl font-bold leading-none tracking-tight text-black tabular-nums ${hasIcon ? 'mt-3' : ''}`}>{value}</p>
            <p className="mt-1.5 text-xs font-medium leading-snug text-neutral-600">{label}</p>
            {children ? <div className="mt-auto w-full pt-2">{children}</div> : null}
        </div>
    )
}

export function Treemap({ data, height = 360 }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState();

    useEffect(() => {
        if (!containerRef.current) return;
        setWidth(containerRef.current.getBoundingClientRect().width);
        const ro = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    function squarifiedLayout(items, x, y, w, h) {
        const sorted = [...items].sort((a, b) => b.count - a.count);
        const total = sorted.reduce((s, d) => s + d.count, 0);
        const rects = [];

        function worst(row, rowSum, isWide, rw, rh) {
            if (!row.length || rowSum === 0) return Infinity;
            const strip = isWide ? rh : rw;
            const long = isWide ? rw : rh;
            const stripPx = (rowSum / total) * long;
            const sizes = row.map((d) => (d.count / rowSum) * strip);
            const maxS = Math.max(...sizes);
            const minS = Math.min(...sizes);
            return Math.max(stripPx / maxS, maxS / stripPx, stripPx / minS, minS / stripPx);
        }

        function layoutRow(row, rowSum, isWide, rx, ry, rw, rh) {
            const long = isWide ? rw : rh;
            const strip = isWide ? rh : rw;
            const stripPx = (rowSum / total) * long;
            let cursor = isWide ? ry : rx;

            for (const item of row) {
                const cellPx = (item.count / rowSum) * strip;
                rects.push({
                    ...item,
                    x: isWide ? rx : cursor,
                    y: isWide ? cursor : ry,
                    w: isWide ? stripPx : cellPx,
                    h: isWide ? cellPx : stripPx,
                });
                cursor += cellPx;
            }

            return isWide
                ? { rx: rx + stripPx, ry, rw: rw - stripPx, rh }
                : { rx, ry: ry + stripPx, rw, rh: rh - stripPx };
        }

        let remaining = sorted;
        let rx = x, ry = y, rw = w, rh = h;

        while (remaining.length > 0) {
            const isWide = rw >= rh;
            let row = [], rowSum = 0;

            for (let i = 0; i < remaining.length; i++) {
                const newRow = [...row, remaining[i]];
                const newSum = rowSum + remaining[i].count;
                if (
                    row.length === 0 ||
                    worst(newRow, newSum, isWide, rw, rh) <=
                    worst(row, rowSum, isWide, rw, rh) + 0.001
                ) {
                    row = newRow;
                    rowSum = newSum;
                } else break;
            }

            const next = layoutRow(row, rowSum, isWide, rx, ry, rw, rh);
            rx = next.rx; ry = next.ry; rw = next.rw; rh = next.rh;
            remaining = remaining.slice(row.length);
        }

        return rects;
    }

    const cleanData = (data || [])
        .map((item) => ({
            ...item,
            channel: (item.channel || "Unknown").replace(/Â/g, ""),
            count: Math.cbrt(Number(item.count) || 0),
            originalCount: Number(item.count) || 0,
        }))
        .sort((a, b) => b.count - a.count);

    if (width === 0) {
        return (
            <div ref={containerRef} className="w-full" style={{ height, borderRadius: 4 }} />
        );
    }

    const GAP = 2;
    const rects = squarifiedLayout(cleanData, 0, 0, 850, height);

    return (
        <div ref={containerRef} className="w-full overflow-hidden" style={{ borderRadius: 4 }}>
            <svg
                width={width}
                height={height}
                style={{ display: "block", borderRadius: 8, overflow: "hidden" }}
            >
                <defs>
                    <filter id="treemap-shadow" x="-5%" y="-5%" width="110%" height="110%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
                    </filter>
                </defs>

                {rects.map((r, i) => {
                    // Apply gap inset
                    const x = r.x + GAP / 2;
                    const y = r.y + GAP / 2;
                    const w = Math.max(r.w - GAP, 0);
                    const h = Math.max(r.h - GAP, 0);

                    const showName = w > 65 && h > 38;
                    const showCount = w > 32 && h > 24;
                    const fontSize = Math.min(14, Math.max(10, w / 9));

                    return (
                        <g key={i}>
                            <rect
                                x={x} y={y}
                                width={w} height={h}
                                fill={r.color}
                                rx={7} ry={7}
                                stroke="rgba(255,255,255,0.18)"
                                strokeWidth={1}
                            >
                                <title>{r.channel} - {r.originalCount}</title>
                            </rect>

                            {showName && (
                                <text
                                    x={x + w / 2}
                                    y={y + h / 2 - (showCount ? fontSize * 0.9 : 0)}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={fontSize}
                                    fontWeight="600"
                                    fill="#ffffff"
                                    opacity={0.95}
                                    style={{ pointerEvents: "none", userSelect: "none" }}
                                >
                                    {r.channel.length > 16 ? r.channel.slice(0, 15) + "…" : r.channel}
                                </text>
                            )}

                            {showCount && (
                                <text
                                    x={x + w / 2}
                                    y={y + h / 2 + (showName ? fontSize * 1.1 : 0)}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={showName ? fontSize * 1.5 : fontSize * 1.1}
                                    fontWeight="700"
                                    fill="#ffffff"
                                    style={{ pointerEvents: "none", userSelect: "none" }}
                                >
                                    {r.originalCount}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}


function LollipopChart({ data, color = "#86bc25", maxWidth = 480, xTicks = [0, 3, 6, 9, 12] }) {
    const max = Math.max(...xTicks); // use xTicks max so grid aligns
    const BAR_H = 44;
    const LEFT = 175;
    const RIGHT = 50;
    const DOT_R = 7;
    const AXIS_H = 28; // space below bars for x-axis
    const svgH = data.length * BAR_H + 8 + AXIS_H;
    const chartW = maxWidth - LEFT - RIGHT;

    const xPos = (val) => LEFT + (val / max) * chartW;

    return (
        <svg
            width="100%"
            viewBox={`0 0 ${maxWidth} ${svgH}`}
            style={{ display: "block", overflow: "visible" }}
        >
            {/* ── Gridlines ── */}
            {xTicks.map((tick) => (
                <line
                    key={tick}
                    x1={xPos(tick)}
                    y1={4}
                    x2={xPos(tick)}
                    y2={data.length * BAR_H + 8}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray={tick === 0 ? "none" : "4 3"}
                />
            ))}

            {/* ── Rows ── */}
            {data.map((d, i) => {
                const y = i * BAR_H + BAR_H / 2 + 4;
                const cx = xPos(d.value);

                return (
                    <g key={i}>
                        {/* Label */}
                        <text
                            x={LEFT - 14}
                            y={y}
                            textAnchor="end"
                            dominantBaseline="middle"
                            fontSize={11}
                            fill="#6b7280"
                        >
                            {d.name.length > 22 ? d.name.slice(0, 21) + "…" : d.name}
                        </text>

                        {/* Stem */}
                        <line
                            x1={LEFT}
                            y1={y}
                            x2={cx}
                            y2={y}
                            stroke={color}
                            strokeWidth={2}
                            strokeLinecap="round"
                            opacity={0.45}
                        />

                        {/* Dot */}
                        <circle cx={cx} cy={y} r={DOT_R} fill={color} />

                        {/* Value */}
                        <text
                            x={cx + DOT_R + 6}
                            y={y}
                            dominantBaseline="middle"
                            fontSize={11}
                            fontWeight="600"
                            fill="#374151"
                        >
                            {d.value}
                        </text>
                    </g>
                );
            })}

            {/* ── X-Axis line ── */}
            <line
                x1={LEFT}
                y1={data.length * BAR_H + 8}
                x2={maxWidth - RIGHT}
                y2={data.length * BAR_H + 8}
                stroke="#e5e7eb"
                strokeWidth={1}
            />

            {/* ── X-Axis tick labels ── */}
            {xTicks.map((tick) => (
                <text
                    key={tick}
                    x={xPos(tick)}
                    y={data.length * BAR_H + 8 + 16}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#9ca3af"
                >
                    {tick}
                </text>
            ))}
        </svg>
    );
}


//Dashboard

const TIME_OPTIONS = ['daily', 'weekly', 'monthly']

function Dashboard() {
    const [timeRange, setTimeRange] = useState('daily')
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const [expanded, setExpanded] = useState(null)
    const [selectedPlatform, setSelectedPlatform] = useState(null);

    const volumeRef = useRef(null)
    const threatRef = useRef(null)
    const regionalRef = useRef(null)
    const contactsRef = useRef(null)
    const handlesRef = useRef(null)
    const platformRef = useRef(null)

    useEffect(() => {
        function handler(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const chartData = aggregateData(rawIncidentData, timeRange)
    // const filteredChartData = useMemo(() => {
    //     if (!selectedPlatform) {
    //         return platformVolumeData.All;
    //     }

    //     return platformVolumeData[selectedPlatform] || [];
    // }, [selectedPlatform]);
    const filteredChartData = useMemo(() => {
    const sourceData = selectedPlatform
        ? platformVolumeData[selectedPlatform]
        : platformVolumeData.All;;

    return aggregateData(sourceData, timeRange);
    }, [selectedPlatform, timeRange]);

    const selectedPlatformData = Platforms.find(
        (p) => p.Platform === selectedPlatform
    );

    // CSV datasets per chart
    const csvMap = {
        volume: chartData,
        threat: threatCategories,
        regional: regionalSegments.map(({ channel, count, percentage }) => ({ channel, count, percentage })),
        contacts: contactPoints.map(({ publisher, count }) => ({ publisher, count })),
        handles: riskHandles.map(({ handle, count }) => ({ handle, count })),
        platform: Platforms,
    }


    const contactsLollipop = contactPoints.map((c) => ({
        name: c.publisher,
        value: c.count,
    }))

    return (
        <main className="min-h-0 flex-1 overflow-auto bg-neutral-100 p-4 lg:p-4">

            {/* ── Header ── */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <span className="h-8 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <h2 className="text-xl font-semibold text-neutral-900">Dashboard</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <FilterButton label="Brand" options={['Air India']} />
                    <FilterButton label="Priority" options={['High', 'Low']} />
                    <FilterButton label="Country" options={['India']} />
                    <DateRangePicker />
                </div>
            </div>

            {/* <div
                style={{
                    marginBottom: 16,
                    padding: "10px 16px",
                    background: "#f9fafb",
                    border: "0.5px solid #e5e7eb",
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="1.8" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1" fill="#9ca3af" />
                </svg>
                <span style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                   Data reflects AI-detected brand infringement activities collected across digital platforms for analysis of unauthorized brand usage, impersonation, promotions, and brand misuse. A total of 1,055 incidents were identified across all platforms, with each platform contributing a specific number of detected infringement cases.
                </span>
            </div> */}
            {/* ── Summary cards ── */}
            <section className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {summaryCards.map((c) => <SummaryCard key={c.label} {...c} />)}
            </section>



            {/* ── Status cards ── */}
            <section className="mb-4 grid gap-3 grid-cols-5">
                <StatusCard iconSrc={`${import.meta.env.BASE_URL}/status-icons/Incidents.png`} value={798} label="Incidents Reported" />
                <StatusCard iconSrc={`${import.meta.env.BASE_URL}/status-icons/underReview.png`} value={798} label="Under Brand Review" />
                <StatusCard iconSrc={`${import.meta.env.BASE_URL}/status-icons/takedown.png`} value={59} label="Closed Incidents" />
                <div className="col-span-2">
                    <StatusCard label="Takedown status">
                        <div className="grid grid-cols-3 gap-0.5 border-t border-neutral-200 pt-2 text-center">
                            {[['38', 'Taken down'], ['37', 'No action'], ['48', 'Recommended to legal']].map(([v, l]) => (
                                <div key={l} className="min-w-0 px-0.5">
                                    <p className="text-lg font-semibold tabular-nums text-neutral-900">{v}</p>
                                    <p className="mt-0.5 text-xs font-medium leading-tight text-neutral-500">{l}</p>
                                </div>
                            ))}
                        </div>
                    </StatusCard>
                </div>
            </section>

            {/* ── Volume chart + Platform distribution ── */}
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                {/* Incidents by Volume */}
                <div ref={volumeRef} className="relative flex flex-col justify-between    border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <h3 className="flex items-center gap-2 text-base font-semibold text-neutral-900">
                            Incidents by Volume

                            {selectedPlatformData && (
                                <span className="ml-2 flex items-center gap-1 text-sm font-normal text-neutral-500">
                                    (<img
                                        src={selectedPlatformData.logo}
                                        alt={selectedPlatformData.Platform}
                                        className="h-4 w-4 object-contain"
                                    />
                                    <span>{selectedPlatformData.Platform}</span>)
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-2">
                            {/* Time range dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen((o) => !o)}
                                    className="inline-flex items-center gap-1   border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:border-neutral-400"
                                >
                                    {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
                                    <IconChevronDown className={`size-4 text-neutral-500 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute right-0 top-full z-10 mt-1 w-36   border border-neutral-200 bg-white py-1 shadow-lg">
                                        {TIME_OPTIONS.map((opt) => (
                                            <button key={opt} type="button"
                                                onClick={() => { setTimeRange(opt); setDropdownOpen(false) }}
                                                className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 ${timeRange === opt ? 'font-semibold text-brand' : 'text-neutral-600'}`}
                                            >
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <ChartMenu
                                title="Incidents by Volume"
                                csvData={csvMap.volume}
                                chartRef={volumeRef}
                                onExpand={() => setExpanded('volume')}
                            />
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <ComposedChart
                            data={filteredChartData}
                            margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
                        >
                            <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#BBBCBC"
                            />

                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />

                            <Tooltip
                            content={<VolumeTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            />

                            <Bar
                            dataKey="incidentsReported"
                            fill="#007680"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />

                            <Bar
                            dataKey="takedownInitiated"
                            fill="#ED8B00"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />

                            <Bar
                            dataKey="closedIncidents"
                            fill="#FFCD00"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />

                            <Bar
                            dataKey="underBrandReview"
                            fill="#62B5E5"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <VolumeLegend />
                </div>

                {/* Platform Distribution */}
                <div ref={platformRef} className=" border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-neutral-900">Platform Distribution</h3>
                        <ChartMenu
                            title="Platform Distribution"
                            csvData={csvMap.platform}
                            chartRef={platformRef}
                            onExpand={() => setExpanded('platform')}
                        />
                    </div>
                    <ul className="max-h-[300px] space-y-5 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent">
                        {Platforms.map((ch) => (
                            <li
                                key={ch.Platform}
                                onClick={() =>
                                setSelectedPlatform(
                                    selectedPlatform === ch.Platform ? null : ch.Platform
                                )
                                }
                                className={`cursor-pointer rounded-md p-2 transition-all
                                ${
                                    selectedPlatform === ch.Platform
                                    ? "bg-orange-50 border border-orange-200"
                                    : "hover:bg-neutral-50"
                                }`}
                            >
                                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">

                                    {/* Left Section */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={ch.logo}
                                            alt={ch.Platform}
                                            className="h-5 w-5 object-contain shrink-0"
                                        />

                                        <span className="truncate font-medium text-neutral-800">
                                            {ch.Platform}
                                        </span>
                                    </div>

                                    {/* Right Section */}
                                    <span className="tabular-nums text-neutral-500 shrink-0">
                                        {ch.percentage}%
                                    </span>
                                </div>

                                <div className="h-2.5 overflow-hidden  bg-neutral-100">
                                    <div className="h-full  bg-[#80C1C5] transition-[width] duration-500" style={{ width: `${ch.percentage}%` }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── Bottom section ── */}
            <section className="pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                    {/* Threat Categories */}
                    <div ref={threatRef} className="flex flex-col    border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-neutral-900">Threat Categories</h3>
                            <div className="flex items-center gap-2">
                                <ChartMenu
                                    title="Threat Categories"
                                    csvData={csvMap.threat}
                                    chartRef={threatRef}
                                    onExpand={() => setExpanded('threat')}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <div className="min-w-[550px]">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={threatCategories} margin={{ top: 10, right: 1, left: 1, bottom: 1 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#BBBCBC" />
                                        <XAxis
                                            dataKey="category"
                                            type="category"
                                            interval={0}
                                            height={100}
                                            tickLine={false}
                                            tickMargin={10}
                                            tick={(props) => {
                                                const { x, y, payload } = props;

                                                const words = payload.value.split(/[\s/]+/);

                                                return (
                                                    <g transform={`translate(${x},${y})`}>
                                                        <text
                                                            x={0}
                                                            y={0}
                                                            dy={24}
                                                            textAnchor="middle"
                                                            fill="#666"
                                                            fontSize={10}
                                                        >
                                                            {words.map((word, index) => (
                                                                <tspan
                                                                    key={index}
                                                                    x="0"
                                                                    dy={index === 0 ? 0 : 12}
                                                                >
                                                                    {word}
                                                                </tspan>
                                                            ))}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        />
                                        <YAxis type="number" width={30} tick={{ fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [value, 'Count']} />
                                        <Bar dataKey="count" fill="#007680" radius={[0, 0, 0, 0]}>
                                            <LabelList
                                                dataKey="count"
                                                position="top"
                                                style={{ fontSize: 10, fill: '#404040' }}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Regional Channel Share */}
                    <div ref={regionalRef} className="   border border-neutral-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-neutral-900">Mentions by Channel</h3>
                            <div className="flex items-center gap-2">

                                <ChartMenu
                                    title="Regional Channel Share"
                                    csvData={csvMap.regional}
                                    chartRef={regionalRef}
                                    onExpand={() => setExpanded('regional')}
                                />
                            </div>
                        </div>
                        <div className="flex flex-row items-center justify-center gap-6 py-2 pt-10">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={regionalSegments} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="count">
                                        {regionalSegments.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        <Label value={regionalSegments.reduce((sum, item) => sum + item.count, 0)} position="center" dy={-8}
                                            style={{ fontSize: '24px', fontWeight: 'bold', fill: '#1f2937', textAnchor: 'middle', dominantBaseline: 'middle' }} />
                                        <Label value="Total Count" position="center" dy={14}
                                            style={{ fontSize: '11px', fontWeight: '500', fill: '#6b7280', textAnchor: 'middle', dominantBaseline: 'middle', letterSpacing: '0.5px' }} />
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', }} formatter={(value) => [value, 'Count']} />
                                </PieChart>
                            </ResponsiveContainer>
                            <ul className="flex flex-col space-y-3 text-sm">
                                {regionalSegments.map((s) => (
                                    <li
                                        key={s.channel}
                                        className="flex items-center justify-between gap-1"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span
                                                className="size-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: s.color }}
                                            />

                                            <span className="font-medium text-neutral-700">
                                                {s.channel} :
                                            </span>
                                        </div>

                                        <span className="w-16 text-right tabular-nums text-neutral-500">
                                            {s.count}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Top Contacts */}
                    {/*           <div ref={contactsRef} className="   border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-900">Top Contacts</h3>
              <div className="flex items-center gap-2">
               
                <ChartMenu
                  title="Top Contacts"
                  csvData={csvMap.contacts}
                  chartRef={contactsRef}
                  onExpand={() => setExpanded('contacts')}
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={contactPoints.map((c) => ({ name: c.publisher.length > 20 ? c.publisher.substring(0,17)+'...' : c.publisher, value: c.count, fullName: c.publisher }))}
                layout="vertical" margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#BBBCBC" />
                <XAxis type="number" tick={{ fontSize: 12}} />
                <YAxis dataKey="name" type="category" width={30} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [value, 'Count']} labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullName || label
                }/>
                <Bar dataKey="value" fill="#86bc25" radius={[0, 0, 0, 0]} >
                  <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#404040' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div> */}

                    {/* <div
                        ref={contactsRef}
                        className="border border-neutral-200 bg-white p-5 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-neutral-900">
                                Top Contacts
                            </h3>
                            <ChartMenu
                                title="Top Contacts"
                                csvData={csvMap.contacts}
                                chartRef={contactsRef}
                                onExpand={() => setExpanded("contacts")}
                            />
                        </div>
                        <div>
                            <LollipopChart
                                data={contactsLollipop}
                                color="#86bc25"
                                maxWidth={600}
                            />
                        </div>
                    </div> */}

                    {/* Top Handles */}
                    {/*           <div ref={handlesRef} className="   border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-neutral-900">Top Handles</h3>
              <div className="flex items-center gap-2">
                <ChartMenu
                  title="Top Handles"
                  csvData={csvMap.handles}
                  chartRef={handlesRef}
                  onExpand={() => setExpanded('handles')}
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={riskHandles.map((r) => ({ name: r.handle.length > 15 ? r.handle.substring(0,15)+'...' : r.handle, value: r.count, fullHandle: r.handle }))}
                layout="vertical" margin={{ top: 5, right: 30, left: 1, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#BBBCBC" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [value, 'Count']} labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullHandle || label
                } />
                <Bar dataKey="value" fill="#86bc25" radius={[0, 0, 0, 0]}>
                  <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#404040' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div> */}

                    {/* <div
                        ref={handlesRef}
                        className="border border-neutral-200 bg-white p-5 shadow-sm"
                    >
                       
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-neutral-900">Top Handles</h3>
                            <ChartMenu
                                title="Top Handles"
                                csvData={csvMap.handles}
                                chartRef={handlesRef}
                                onExpand={() => setExpanded("handles")}
                            />
                        </div>

             
                        <Treemap data={riskHandles} height={265} />

                        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-neutral-600">
                            {riskHandles.map((s) => (
                                <li key={s.channel} className="flex items-center gap-1.5">
                                    <span
                                        className="size-2.5 shrink-0 rounded-sm"
                                        style={{ backgroundColor: s.color }}
                                    />
                                    <span>{s.channel}</span>
                                    <span className="tabular-nums text-neutral-400">({s.count})</span>
                                </li>
                            ))}
                        </ul>
                    </div> */}

                </div>
            </section>

            {/* ── Expand Modals ── */}
            {expanded === 'volume' && (
                <ExpandModal title="Incidents by Volume" onClose={() => setExpanded(null)}>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart
                            data={filteredChartData}
                            margin={{ top: 5, right: 5, left: -30, bottom: 0 }}
                        >
                            <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#BBBCBC"
                            />

                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />

                            <Tooltip
                            content={<VolumeTooltip />}
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            />

                            <Bar
                            dataKey="incidentsReported"
                            fill="#86BC25"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />

                            <Bar
                            dataKey="takedownInitiated"
                            fill="#ED8B00"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />

                            <Bar
                            dataKey="closedIncidents"
                            fill="#FFCD00"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />

                            <Bar
                            dataKey="underBrandReview"
                            fill="#62B5E5"
                            barSize={18}
                            radius={[0, 0, 0, 0]}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <VolumeLegend />
                </ExpandModal>
            )}

            {expanded === 'threat' && (
                <ExpandModal title="Threat Categories" onClose={() => setExpanded(null)}>
                    <ResponsiveContainer width="100%" height={420}>
                        <BarChart data={threatCategories} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#BBBCBC" />
                            <XAxis
                                dataKey="category"
                                type="category"
                                interval={0}
                                height={100}
                                tickLine={false}
                                tickMargin={10}
                                tick={(props) => {
                                    const { x, y, payload } = props;

                                    const words = payload.value.split(" ");

                                    return (
                                        <g transform={`translate(${x},${y})`}>
                                            <text
                                                x={0}
                                                y={0}
                                                dy={16}
                                                textAnchor="middle"
                                                fill="#666"
                                                fontSize={10}
                                            >
                                                {words.map((word, index) => (
                                                    <tspan
                                                        key={index}
                                                        x="0"
                                                        dy={index === 0 ? 0 : 12}
                                                    >
                                                        {word}
                                                    </tspan>
                                                ))}
                                            </text>
                                        </g>
                                    );
                                }} />
                            <YAxis type="number" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }} formatter={(value) => [value, 'Count']} />
                            <Bar dataKey="count" fill="#86bc25" radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="count" position="top" style={{ fontSize: 12, fill: '#404040' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ExpandModal>
            )}

            {expanded === 'regional' && (
                <ExpandModal title="Mentions by Channel" onClose={() => setExpanded(null)}>
                    <div className="flex flex-row items-center justify-center gap-12 py-6">
                        <ResponsiveContainer width={280} height={280}>
                            <PieChart>
                                <Pie data={regionalSegments} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={2} dataKey="count">
                                    {regionalSegments.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    <Label value={regionalSegments.reduce((sum, item) => sum + item.count, 0)} position="center" dy={-10}
                                        style={{ fontSize: '32px', fontWeight: 'bold', fill: '#1f2937', textAnchor: 'middle', dominantBaseline: 'middle' }} />
                                    <Label value="Total Count" position="center" dy={18}
                                        style={{ fontSize: '13px', fontWeight: '500', fill: '#6b7280', textAnchor: 'middle', dominantBaseline: 'middle' }} />
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', }} formatter={(value) => [value, 'Count']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <ul className="flex flex-col space-y-4 text-sm">
                            {regionalSegments.map((s) => (
                                <li key={s.channel} className="flex items-center gap-3">
                                    <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="flex items-baseline gap-2 text-neutral-700">
                                        <span className="font-medium">{s.channel} :</span>
                                        <span className="tabular-nums text-neutral-500">{s.count}</span>
                                        <span className="text-neutral-400">({s.percentage}%)</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </ExpandModal>
            )}



            {expanded === 'contacts' && (
                <ExpandModal title="Top Contacts" onClose={() => setExpanded(null)}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                    </div>
                    <div>
                        <LollipopChart
                            data={contactsLollipop}
                            color="#86bc25"
                            maxWidth={600}
                        />
                    </div>
                </ExpandModal>
            )}

            {expanded === 'handles' && (
                <ExpandModal title="Top Handles" onClose={() => setExpanded(null)}>
                    {/* <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={riskHandles.map((r) => ({ name: r.handle, value: r.count }))}
              layout="vertical" margin={{ top: 5, right: 40, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#BBBCBC" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', }} formatter={(value) => [value, 'Count']} />
              <Bar dataKey="value" fill="#86bc25" radius={[0, 4, 4, 0]} >
                <LabelList
                  dataKey="value"
                  position="right"
                  style={{ fontSize: 12, fill: '#404040' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer> */}

                    <Treemap data={riskHandles} height={265} />

                    {/* Legend */}
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-neutral-600">
                        {riskHandles.map((s) => (
                            <li key={s.channel} className="flex items-center gap-1.5">
                                <span
                                    className="size-2.5 shrink-0 rounded-sm"
                                    style={{ backgroundColor: s.color }}
                                />
                                <span>{s.channel}</span>
                                <span className="tabular-nums text-neutral-400">({s.count})</span>
                            </li>
                        ))}
                    </ul>

                </ExpandModal>
            )}

            {expanded === 'platform' && (
                <ExpandModal title="Platform Distribution" onClose={() => setExpanded(null)}>
                    <ul className="space-y-5 px-4 py-2">
                        {Platforms.map((ch) => (
                            <li
                                key={ch.Platform}
                                onClick={() =>
                                setSelectedPlatform(
                                    selectedPlatform === ch.Platform ? null : ch.Platform
                                )
                                }
                                className={`cursor-pointer rounded-md p-2 transition-all
                                ${
                                    selectedPlatform === ch.Platform
                                    ? "bg-orange-50 border border-orange-200"
                                    : "hover:bg-neutral-50"
                                }`}
                            >
                                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">

                                    {/* Left Section */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <img
                                            src={ch.logo}
                                            alt={ch.Platform}
                                            className="h-5 w-5 object-contain shrink-0"
                                        />

                                        <span className="truncate font-medium text-neutral-800">
                                            {ch.Platform}
                                        </span>
                                    </div>

                                    {/* Right Section */}
                                    <span className="tabular-nums text-neutral-500 shrink-0">
                                        {ch.percentage}%
                                    </span>
                                </div>

                                <div className="h-2.5 overflow-hidden  bg-neutral-100">
                                    <div className="h-full  bg-brand transition-[width] duration-500" style={{ width: `${ch.percentage}%` }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </ExpandModal>
            )}

        </main>
    )
}


export default Dashboard