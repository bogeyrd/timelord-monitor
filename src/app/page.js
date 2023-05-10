'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaBitcoin, FaLandmark, FaChartPie, FaStream, FaRocket, FaClock } from 'react-icons/fa';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

/**
 * Utilities
 */

function getApiHost() {
  if (process.env.NODE_ENV === 'production') {
    return process.env.apiUrl;
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

function formatNumberString(n) {
  if (typeof n === 'number') {
    return n.toLocaleString();
  }
  return replaceUndefined(n);
}

function formatSeconds(secs) {
  if (typeof secs === 'undefined' || secs === null) {
    secs = 0;
  }
  const s = secs % 60;
  const m = Math.floor(secs / 60) % 60;
  const h = Math.floor(m / 60);
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
    axios.get(getApiHost() + '/api/status?rn=' + Math.random()).then(function(res) {
      setStatus(res.data);
    });
  };
  return [status, query];
}

function useTimelordSummary(hours) {
  const [summary, setSummary] = useState();
  const query = () => {
    axios.get(getApiHost() + '/api/summary?hours=' + hours + '&rn=' + Math.random()).then(function(res) {
      setSummary(res.data);
    });
  };
  return [summary, query];
}

/**
 * Base components
 */

function SectionTitle({ Icon, title }) {
  return (
    <>
      <div className='flex flex-row py-2'>
        <Icon />
        <div className='font-bold text-xs italic pl-2'>{title}</div>
      </div>
    </>
  );
}

function StatusEntry({ name, value }) {
  return (
    <div className='p-1 text-sm flex flex-row'>
      <div>{name}</div><div className='font-mono text-right grow'>{replaceUndefined(value)}</div>
    </div>
  )
}

/**
 * Title and header
 */

function Title({ server_ip }) {
  return (
    <div className='flex flex-row text-white bg-gray-500 p-2'>
      <div className='text-xl font-bold w-auto'>Timelord Service</div>
      <div className='text-xs text-right grow self-center'>HOST: {server_ip}</div>
    </div>
  )
}

/**
 * Base status
 */

function StatusBase({ iters_per_sec }) {
  return (
    <>
      <SectionTitle Icon={FaLandmark} title='Base' />
      <StatusEntry name='Version' value={'beta 0.1.0'} />
      <StatusEntry name='VDF speed' value={formatNumberString(iters_per_sec) + ' ips'} />
    </>
  )
}

function StatusArriving({ height, challenge, total_size, vdf_pack }) {
  let requests = null;
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
  };
  return (
    <>
      <SectionTitle Icon={FaRocket} title='Arriving' />
      <StatusEntry name='Incoming height' value={formatNumberString(height)} />
      <StatusEntry name='Challenge' value={shortHashString(challenge)} />
      <StatusEntry name='Netspace' value={formatNumberString(total_size)} />
      <SectionTitle Icon={FaClock} title='Next block' />
      <StatusEntry name='Estimated time' value={formatSeconds(estimated_seconds)} />
      <StatusEntry name='Previous block' value={formatLocalTime(timestamp)} />
      <StatusEntry name='Next block' value={formatLocalTime(timestamp ? timestamp + estimated_seconds : null)} />
    </>
  )
}

function StatusLastBlockInfo({ hash, height, address, reward, accumulate, filter_bits, vdf_time, vdf_iters, vdf_speed, challenge_difficulty, block_difficulty }) {
  return (
    <>
      <SectionTitle Icon={FaBitcoin} title='Last block info.' />
      <StatusEntry name='Hash' value={shortHashString(hash)} />
      <StatusEntry name='Height' value={formatNumberString(height)} />
      <StatusEntry name='Miner' value={address} />
      <StatusEntry name='Reward' value={replaceUndefined(reward) + ' BHD'} />
      <StatusEntry name='Accumulate' value={formatNumberString(accumulate) + ' BHD'} />
      <StatusEntry name='Filter-bit' value={filter_bits} />
      <StatusEntry name='VDF speed' value={formatNumberString(vdf_speed)} />
      <StatusEntry name='VDF time' value={vdf_time} />
      <StatusEntry name='VDF iterations' value={formatNumberString(vdf_iters)} />
      <StatusEntry name='Challenge difficulty' value={formatNumberString(challenge_difficulty)} />
      <StatusEntry name='Block difficulty' value={formatNumberString(block_difficulty)} />
    </>
  )
}

function Status({ challenge, height, iters_per_sec, total_size, last_block_info, vdf_pack }) {
  return (
    <>
      <StatusBase iters_per_sec={iters_per_sec} />
      <StatusArriving height={height} challenge={challenge} total_size={total_size} vdf_pack={vdf_pack} />
      <StatusLastBlockInfo {...last_block_info} />
    </>
  )
}

/**
 * Summary
 */

function SummaryPie({ hours, summary }) {
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
    [250, 70, 70],
  ];

  const colorWithAlpha = (color, alpha) => {
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  };

  if (typeof summary === 'undefined') {
    return (
      <div />
    );
  }

  for (let i = 0; i < summary.length; ++i) {
    const entry = summary[i];
    data.labels.push(`<${entry.min}m`);
    data.datasets[0].data.push(entry.count);
    data.datasets[0].backgroundColor.push(colorWithAlpha(colors[i], '0.7'));
  }

  return (
    <>
      <SectionTitle Icon={FaChartPie} title={'Blocks in ' + (hours ? (hours + ' hours') : '...')} />
      <Pie className='pb-4' data={data} />
    </>
  )
}

function SummaryStatus({ num_blocks, high_height, low_height, hours }) {
  return (
    <>
      <SectionTitle Icon={FaStream} title={`Summary in ${hours} hours`} />
      <StatusEntry name='Total blocks' value={formatNumberString(num_blocks)} />
      <StatusEntry name='Time per block' value={formatNumberString(hours * 60 / num_blocks) + ' min'} />
      <StatusEntry name='Block range' value={formatNumberString(low_height) + ' ... ' + formatNumberString(high_height)} />
    </>
  )
}

function Summary({ num_blocks, high_height, low_height, hours, summary }) {
  return (
    <>
      <SummaryPie summary={summary} hours={hours} />
      <SummaryStatus num_blocks={num_blocks} hours={hours} low_height={low_height} high_height={high_height} />
    </>
  )
}

/**
 * Main
 */

export default function Home() {
  const [status, queryStatus] = useTimelordStatus();
  const [summary, querySummary] = useTimelordSummary(24);
  useEffect(() => {
    ChartJS.register(ArcElement, Tooltip, Legend);
    queryStatus();
    querySummary();
  }, []);
  return (
    <main className='container'>
      <Title {...status} />
      <div className='p-3'>
        <Status {...status} />
        <Summary {...summary} />
      </div>
    </main>
  );
}
