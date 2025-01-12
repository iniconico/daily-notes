import {type SeriesConfig} from "vuepress-theme-reco/lib/types/nav";

const AQS_Series = [
    "AQS学习",
    "AQS-CountDownLatch",
    "AQS-ReentrantLock",
    "AQS-ReentrantReadWriteLock",
];
const Synchronized_Series = [
    "Synchronized学习",
    "Synchronized字节码",
];
export const series: SeriesConfig = {
    "/docs/back-end/": [
        {
            text: '后端',
            children: ["test"],
        },
    ],
    "/series/back-end/java/": ["BigDecimal最佳实践"],
    "/series/back-end/concurrent/": [
        {
            text: "AQS",
            children: AQS_Series,
        },
        {
            text: "Synchronized",
            children: Synchronized_Series,
        },
    ]
};