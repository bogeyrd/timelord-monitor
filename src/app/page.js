'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaBitcoin, FaLandmark, FaChartPie, FaStream, FaRocket, FaClock, FaHdd, FaHackerrank, FaHubspot, FaCubes } from 'react-icons/fa';

import 'chart.js/auto';
import { Pie, Line } from 'react-chartjs-2';

/**
 * Utilities
 */

function getApiHost() {
    if (process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:39393';
}

function replaceUndefined(v) {
    if (typeof v === 'undefined') {
        return '...';
    }
    return v;
}

function shortHashString(hash) {
    if (typeof hash === 'string') {
        return hash.substring(0, 4) + '...' + hash.substring(hash.length - 4);
    }
    return replaceUndefined(hash);
}

function calcMod(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        return [0, 0];
    }
    a = Math.floor(a);
    b = Math.floor(b);
    if (b === 0) {
        return [0, 0];
    }
    const r2 = a % b;
    const r1 = Math.floor(a / b);
    return [r1, r2];
}

function makeDurationByHours(hours) {
    if (typeof hours != 'number') {
        return '...';
    }
    if (hours > 24) {
        return `${hours / 24} days`;
    }
    return `${hours} hours`;
}

function formatNumberString(n) {
    if (typeof n === 'number') {
        n = Math.floor(n * 100) / 100;
        return n.toLocaleString();
    }
    return replaceUndefined(n);
}

function formatSeconds(secs) {
    if (typeof secs === 'undefined' || secs === null) {
        secs = 0;
    }
    let [m1, s] = calcMod(secs, 60);
    let [h, m] = calcMod(m1, 60);
    if (h > 0) {
        return `${h}:${m}:${s}`;
    } else {
        return `${m}:${s}`;
    }
}

function formatLocalTime(timestamp) {
    if (typeof timestamp === 'undefined' || timestamp === null) {
        return '...';
    }
    let the_time = new Date(timestamp * 1000);
    return the_time.toLocaleString('en-US');
}

/**
 * React status
 */

function useTimelordStatus() {
    const [status, setStatus] = useState();
    const query = () => {
        axios.get(getApiHost() + '/api/status?rn=' + Math.random()).then(function (res) {
            setStatus(res.data);
        });
    };
    return [status, query];
}

function useTimelordSummary(hours) {
    const [summary, setSummary] = useState();
    const query = () => {
        axios.get(getApiHost() + '/api/summary?hours=' + hours + '&rn=' + Math.random()).then(function (res) {
            setSummary(res.data);
        });
    };
    return [summary, query];
}

function useTimelordNetspace(hours) {
    const [netspace, setNetspace] = useState();
    const query = () => {
        axios.get(getApiHost() + '/api/netspace?hours=' + hours + '&rn=' + Math.random()).then(function (res) {
            setNetspace(res.data);
        });
    };
    return [netspace, query];
}

function useRank(hours) {
    let postUrl;
    if (typeof hours === 'undefined') {
        postUrl = '/api/rank?rn=' + Math.random();
    } else {
        postUrl = '/api/rank?hours=' + hours + '&rn=' + Math.random();
    }
    const [rank, setRank] = useState();
    const query = () => {
        axios.get(getApiHost() + postUrl).then(function (res) {
            setRank(res.data);
        });
    };
    return [rank, query];
}

/**
 * Base components
 */

function SectionTitle({ Icon, title, desc }) {
    return (
        <div className="flex flex-row py-2 lg:pt-4 items-center">
            <Icon />
            <div className="font-bold italic pl-2">{title}</div>
            <div className="text-xs pl-4">{desc}</div>
        </div>
    );
}

function StatusEntry({ name, value, error, hi, strong_value }) {
    let clsName = 'p-[2px] flex flex-row';
    if (error) {
        clsName = clsName + ' text-red-700';
    }
    if (typeof hi !== 'undefined') {
        if (hi) {
            clsName = clsName + ' bg-gray-50 lg:bg-gray-100 dark:bg-gray-600 dark:lg:bg-gray-600';
        } else {
            clsName = clsName + ' bg-gray-200 dark:bg-gray-600 dark:lg:bg-gray-600';
        }
    }
    let clsNameVal = 'font-mono text-right grow';
    let clsNameName = 'italic';
    if (strong_value) {
        clsNameVal = clsNameVal + ' italic font-bold';
    }
    return (
        <div className={clsName}>
            <div className={clsNameName}>{name}</div>
            <div className={clsNameVal}>{replaceUndefined(value)}</div>
        </div>
    );
}

function Description({ desc }) {
    return <span className="px-4 line-clamp-2 text-xs text-gray-500">{desc}</span>;
}

/**
 * Title and header
 */

function Title({ server_ip }) {
    return (
        <div className="flex flex-row p-2 bg-gray-300 dark:bg-gray-700 lg:bg-inherit lg:flex-col lg:pt-8">
            <div className="text-xl font-bold w-auto lg:self-center lg:text-3xl lg:pb-2">BitcoinHD chain</div>
            <div className="text-xs text-right grow self-center">
                <span className="font-bold">Timelord service</span> <span className="underline">{server_ip}</span>
            </div>
        </div>
    );
}

/**
 * Base status
 */

function StatusBase({ iters_per_sec, num_connections, fork_height, status_string }) {
    return (
        <>
            <SectionTitle Icon={FaLandmark} title="Base" />
            <StatusEntry name="Version" value={'beta 0.1.0'} />
            <StatusEntry name="VDF speed" value={formatNumberString(iters_per_sec) + ' ips'} />
            <StatusEntry name="Connections" value={num_connections} />
            <StatusEntry name="Fork height" value={fork_height} />
            <StatusEntry name="Status" value={status_string} error={status_string !== 'good'} />
        </>
    );
}

function StatusArriving({ height, challenge, total_size, max_size, estimated_netspace, vdf_pack, num_connections, difficulty }) {
    let requests = [];
    let timestamp = null;
    if (vdf_pack) {
        requests = vdf_pack.requests;
        timestamp = vdf_pack.timestamp;
    }
    let best = null;
    if (requests) {
        for (let req of requests) {
            if (best === null) {
                best = req;
            } else if (req.iters < best.iters) {
                best = req;
            }
        }
    }
    let estimated_seconds = 0;
    if (best) {
        estimated_seconds = best.estimated_seconds;
    }
    return (
        <>
            <SectionTitle Icon={FaRocket} title="Arriving" />
            <StatusEntry name="Incoming height" value={formatNumberString(height)} />
            <StatusEntry name="Challenge" value={shortHashString(challenge)} />
            <StatusEntry name="Challenge difficulty" value={formatNumberString(difficulty)} />
            <StatusEntry name="Netspace" value={formatNumberString(total_size)} />
            <StatusEntry name="Maximum" value={formatNumberString(max_size)} />
            <StatusEntry name="Estimated (TiB)" value={formatNumberString(estimated_netspace)} />
            <SectionTitle Icon={FaClock} title="Next block" />
            <StatusEntry name="Estimated time" value={formatSeconds(estimated_seconds)} />
            <StatusEntry name="Number of answers" value={`${formatNumberString(requests.length)}/${formatNumberString(num_connections)}`} />
            <StatusEntry name="Previous block" value={formatLocalTime(timestamp)} />
            <StatusEntry name="Next block" value={formatLocalTime(timestamp ? timestamp + estimated_seconds : null)} />
        </>
    );
}

function StatusPledgeInfo({ retarget_min_heights, pledges }) {
    const noterm = pledges ? pledges[0] : { lock_height: 0, actual_percent: 0 };
    const term1 = pledges ? pledges[1] : { lock_height: 0, actual_percent: 0 };
    const term2 = pledges ? pledges[2] : { lock_height: 0, actual_percent: 0 };
    const term3 = pledges ? pledges[3] : { lock_height: 0, actual_percent: 0 };
    return (
        <>
            <SectionTitle Icon={FaCubes} title="Pledge" />
            <StatusEntry name="NoTerm" value={`${formatNumberString(noterm.lock_height)} blocks (${noterm.lock_height / 480}-day) ${noterm.actual_percent}%`} />
            <StatusEntry name="Term1" value={`${formatNumberString(term1.lock_height)} blocks (${term1.lock_height / 480}-day) ${term1.actual_percent}%`} />
            <StatusEntry name="Term2" value={`${formatNumberString(term2.lock_height)} blocks (${term2.lock_height / 480}-day) ${term2.actual_percent}%`} />
            <StatusEntry name="Term3" value={`${formatNumberString(term3.lock_height)} blocks (${term3.lock_height / 480}-day) ${term3.actual_percent}%`} />
            <StatusEntry name="Retarget Min." value={`${retarget_min_heights} blocks`} />
        </>
    );
}

function StatusLastBlockInfo({ hash, height, address, reward, accumulate, filter_bits, vdf_time, vdf_iters, vdf_speed, challenge_difficulty, block_difficulty }) {
    return (
        <>
            <SectionTitle Icon={FaBitcoin} title="Last block" />
            <StatusEntry name="Hash" value={shortHashString(hash)} />
            <StatusEntry name="Height" value={formatNumberString(height)} />
            <StatusEntry name="Miner" value={address} />
            <StatusEntry name="Reward" value={replaceUndefined(reward) + ' BHD'} />
            <StatusEntry name="Accumulate" value={formatNumberString(accumulate) + ' BHD'} />
            <StatusEntry name="Filter-bit" value={filter_bits} />
            <StatusEntry name="VDF speed" value={formatNumberString(vdf_speed)} />
            <StatusEntry name="VDF time" value={vdf_time} />
            <StatusEntry name="VDF iterations" value={formatNumberString(vdf_iters)} />
            <StatusEntry name="Challenge difficulty" value={formatNumberString(challenge_difficulty)} />
            <StatusEntry name="Block difficulty" value={formatNumberString(block_difficulty)} />
        </>
    );
}

function StatusSupply({ dist_height, calc, last }) {
    const height = calc ? calc.height : 0;
    const burned = calc ? calc.burned : 0;
    const actual = calc ? calc.actual : 0;
    const height2 = last ? last.height : 0;
    const burned2 = last ? last.burned : 0;
    const actual2 = last ? last.actual : 0;
    return (
        <>
            <SectionTitle Icon={FaHubspot} title="Supply" />
            <StatusEntry name="Interval heights" value={formatNumberString(dist_height)} />
            <StatusEntry name="Calculated on height" value={formatNumberString(height)} />
            <StatusEntry name="Burned" value={formatNumberString(burned)} />
            <StatusEntry name="Total" value={formatNumberString(actual)} />
            <StatusEntry name="Minimal pledge amount" value={formatNumberString(actual / 2016)} />
            <SectionTitle Icon={FaHubspot} title="Current" />
            <StatusEntry name="Current height" value={formatNumberString(height2)} />
            <StatusEntry name="Current Burned" value={formatNumberString(burned2)} />
            <StatusEntry name="Current Total" value={formatNumberString(actual2)} />
        </>
    );
}

function Status({ challenge, height, iters_per_sec, total_size, max_size, min_size, difficulty, num_connections, status_string, last_block_info, vdf_pack, supply, pledge_info, estimated_netspace, fork_height }) {
    return (
        <>
            <div className="lg:w-[430px]">
                <StatusBase iters_per_sec={iters_per_sec} num_connections={num_connections} status_string={status_string} max_size={max_size} min_size={min_size} fork_height={fork_height} />
                <StatusArriving height={height} challenge={challenge} total_size={total_size} max_size={max_size} vdf_pack={vdf_pack} num_connections={num_connections} difficulty={difficulty} estimated_netspace={estimated_netspace} />
                <StatusPledgeInfo {...pledge_info} />
            </div>
            <div className="lg:w-[430px]">
                <StatusLastBlockInfo {...last_block_info} />
                <StatusSupply {...supply} />
            </div>
        </>
    );
}

/**
 * Summary
 */

function SummaryPie({ hours, summary, num_blocks }) {
    if (typeof summary === 'undefined') {
        return <div />;
    }

    const data = {
        labels: [],
        datasets: [
            {
                label: 'Blocks',
                data: [],
                backgroundColor: [],
                borderColor: [],
                borderWidth: 0,
            },
        ],
    };

    const colors = [
        [70, 250, 70],
        [70, 220, 70],
        [70, 200, 70],
        [250, 0, 0],
        [100, 0, 0],
    ];

    const colorWithAlpha = (color, alpha) => {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    };

    const labels = ['1m-3m', '3m-10m', '10m-30m', '30m-60m', '>60m'];
    let count_blocks = 0;
    for (let i = 0; i < summary.length + 1; ++i) {
        let entry;
        if (i === summary.length) {
            entry = {
                count: num_blocks - count_blocks,
                min: 0,
            };
        } else {
            entry = summary[i];
            count_blocks += entry.count;
        }
        data.labels.push(`${labels[i]}=${entry.count}`);
        data.datasets[0].data.push(entry.count);
        data.datasets[0].backgroundColor.push(colorWithAlpha(colors[i], '0.7'));
    }

    const hours_str = makeDurationByHours(hours);
    return (
        <>
            <SectionTitle Icon={FaChartPie} title={'Blocks in ' + hours_str} />
            <Description desc={`The chart shows the block duration statistics for the past ${hours_str}.`} />
            <Pie className="lg:p-4" data={data} />
        </>
    );
}

function SummaryStatus({ num_blocks, high_height, low_height, hours, avg_duration }) {
    const hours_str = makeDurationByHours(hours);
    return (
        <>
            <SectionTitle Icon={FaStream} title={'Summary in ' + hours_str} />
            <StatusEntry name="Total blocks" value={formatNumberString(num_blocks)} />
            <StatusEntry name="Time per block" value={formatSeconds(avg_duration)} />
            <StatusEntry name="Block range" value={formatNumberString(low_height) + ' ... ' + formatNumberString(high_height)} />
        </>
    );
}

function SummaryNetspace({ netspace }) {
    if (typeof netspace === 'undefined') {
        return <div />;
    }
    const options = {
        responsive: true,
        plugins: {
            title: {
                display: false,
            },
        },
    };
    let labels = [];
    let data = {
        labels,
        datasets: [
            {
                label: 'Challenge diff.',
                data: [],
                pointStyle: false,
                borderWidth: 1,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(200, 200, 200, 0.5)',
            },
            {
                label: 'Netspace',
                data: [],
                pointStyle: false,
                borderWidth: 1,
                borderColor: 'rgb(100, 100, 200)',
                backgroundColor: 'rgba(200, 200, 200, 0.5)',
            },
            {
                label: 'Block diff.',
                data: [],
                pointStyle: false,
                borderWidth: 1,
                borderColor: 'rgb(200, 200, 200)',
                backgroundColor: 'rgba(200, 200, 200, 0.5)',
            },
        ],
    };
    let min_netspace = 0;
    let max_netspace = 0;
    let min_ch_diff = 0;
    let max_ch_diff = 0;
    for (let i = 0; i < netspace.length - 1; ++i) {
        const entry = netspace[i];
        labels.push(entry.height);
        data.datasets[0].data.push(entry.challenge_difficulty / 1000000000);
        data.datasets[1].data.push(entry.netspace / 1000000000000);
        data.datasets[2].data.push(entry.block_difficulty / 1000000000);
        if (min_netspace === 0 || min_netspace > entry.netspace) {
            min_netspace = entry.netspace;
        }
        if (max_netspace < entry.netspace) {
            max_netspace = entry.netspace;
        }
        if (min_ch_diff === 0 || min_ch_diff > entry.challenge_difficulty) {
            min_ch_diff = entry.challenge_difficulty;
        }
        if (max_ch_diff < entry.challenge_difficulty) {
            max_ch_diff = entry.challenge_difficulty;
        }
    }
    return (
        <>
            <SectionTitle Icon={FaHdd} title="Difficulty variation in 7 days" />
            <div className="mb-4 lg:mb-8 lg:flex lg:flex-row lg:justify-between">
                <div className="lg:w-[430px]">
                    <StatusEntry name="Maximum netspace" value={formatNumberString(max_netspace)} />
                    <StatusEntry name="Minimum netspace" value={formatNumberString(min_netspace)} />
                </div>
                <div className="lg:w-[430px]">
                    <StatusEntry name="Maximum challenge diff." value={formatNumberString(max_ch_diff)} />
                    <StatusEntry name="Minimum challenge diff." value={formatNumberString(min_ch_diff)} />
                </div>
            </div>
            <Line options={options} data={data} />
        </>
    );
}

function Summary({ num_blocks, high_height, low_height, hours, summary, avg_duration }) {
    return (
        <div className="lg:w-[430px]">
            <SummaryStatus num_blocks={num_blocks} hours={hours} low_height={low_height} high_height={high_height} avg_duration={avg_duration} />
            <SummaryPie summary={summary} hours={hours} num_blocks={num_blocks} />
        </div>
    );
}

function Rank({ rank, title }) {
    let begin_height;
    let entries = [];
    if (rank) {
        begin_height = rank.begin_height;
        entries = rank.entries;
    }
    return (
        <>
            <SectionTitle Icon={FaHackerrank} title={title} desc={'Since height ' + formatNumberString(begin_height)} />
            {entries.map((entry, i) => {
                return (
                    <div className="mb-2">
                        <StatusEntry name="Farmer public-key" strong_value value={shortHashString(entry.farmer_pk)} hi={i % 2 === 0} />
                        <StatusEntry name="Produced blocks" value={formatNumberString(entry.count)} hi={i % 2 === 0} />
                        <StatusEntry name="Avg. Block Difficulty" value={formatNumberString(entry.average_difficulty)} hi={i % 2 === 0} />
                        <StatusEntry name="Rewards" value={formatNumberString(entry.total_reward) + ' BHD'} hi={i % 2 === 0} />
                    </div>
                );
            })}
        </>
    );
}

/**
 * Main
 */

export default function Home() {
    const [baseStatus, queryStatus] = useTimelordStatus();
    const [summary24, querySummary24] = useTimelordSummary(24);
    const [summary24_7, querySummary24_7] = useTimelordSummary(24 * 7);
    const [netspace, queryNetspace] = useTimelordNetspace(24 * 7);
    const [rank, queryRank] = useRank();
    const [rank24, queryRank24] = useRank(24);
    useEffect(() => {
        queryStatus();
        querySummary24();
        querySummary24_7();
        queryNetspace();
        queryRank();
        queryRank24();
    }, []);
    return (
        <main className="flex flex-col items-center text-sm">
            <div className="w-full bg-gray-100 lg:w-[1000px] lg:bg-white dark:bg-gray-900 dark:lg:bg-gray-900">
                <Title {...baseStatus} />
                <div className="p-3">
                    <div className="lg:flex lg:flex-row lg:justify-between lg:p-8 lg:bg-gray-50 lg:rounded-2xl dark:lg:bg-gray-700">
                        <Status {...baseStatus} />
                    </div>
                    <div className="lg:p-8">
                        <SummaryNetspace netspace={netspace} />
                    </div>
                    <div className="lg:flex lg:flex-row lg:justify-between lg:p-8">
                        <Summary {...summary24} />
                        <Summary {...summary24_7} />
                    </div>
                    <div className="lg:bg-gray-50 dark:lg:bg-gray-700 lg:rounded-2xl">
                        <div className="mt-4 lg:p-8">
                            <Rank title="Rank" rank={rank} />
                        </div>
                        <div className="my-4 lg:p-8">
                            <Rank title="Rank in 24 hours" rank={rank24} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
