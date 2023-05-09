'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { SiBlockchaindotcom } from 'react-icons/si';
import { FaChartPie, FaStream } from 'react-icons/fa';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

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

function useTimelordStatus() {
  const [status, setStatus] = useState();
  const query = () => {
    axios.get('http://localhost:39393/api/status?rn=' + Math.random()).then(function(res) {
      setStatus(res.data);
    });
  };
  return [status, query];
}

function useTimelordSummary(hours) {
  const [summary, setSummary] = useState();
  const query = () => {
    axios.get('http://localhost:39393/api/summary?hours=' + hours + '&rn=' + Math.random()).then(function(res) {
      setSummary(res.data);
    });
  };
  return [summary, query];
}

function Separator({ Icon, title }) {
  return (
    <>
      <hr />
      <div className='flex flex-row pl-1 pt-4 pb-1'>
        <Icon />
        <SectionTitle title={title} />
      </div>
    </>
  );
}

function Title() {
  return (
    <div className='flex flex-row bg-blue-200 p-1'>
      <div className='text-xl font-bold w-auto'>Timelord Status</div>
      <div className='text-xs text-right grow self-center'>HOST: unavailable</div>
    </div>
  )
}

function StatusEntry({ name, value }) {
  return (
    <div className='p-1 text-sm flex flex-row'>
      <div>{name}</div><div className='font-mono text-right grow'>{replaceUndefined(value)}</div>
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <div className='font-bold text-xs italic pl-2'>{title}</div>
  )
}

function LastBlockInfo({ height, address, reward, accumulate, filter_bits, vdf_time, vdf_iters, vdf_speed, challenge_difficulty, block_difficulty }) {
  return (
    <div>
      <Separator Icon={SiBlockchaindotcom} title='Last block info.' />
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
    </div>
  )
}

function Status({ challenge, height, iters_per_sec, total_size, last_block_info }) {
  return (
    <div className='bg-gray-50 p-1'>
      <StatusEntry name='Challenge' value={shortHashString(challenge)} />
      <StatusEntry name='VDF speed' value={replaceUndefined(iters_per_sec) + ' ips'} />
      <StatusEntry name='Incoming height' value={formatNumberString(height)} />
      <StatusEntry name='Netspace' value={total_size} />
      <LastBlockInfo {...last_block_info} />
    </div>
  )
}

function SummaryPie({ summary }) {
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

  return <Pie className='pb-4' data={data} />;
}

function Summary({ num_blocks, high_height, low_height, hours, summary }) {
  return (
    <div className='bg-gray-50 p-1'>
      <Separator Icon={FaChartPie} title={'Blocks in ' + (hours ? (hours + ' hours') : '...')} />
      <SummaryPie summary={summary} />
      <Separator Icon={FaStream} title='Summary' />
      <StatusEntry name='Total blocks' value={formatNumberString(num_blocks)} />
      <StatusEntry name='Time per block' value={formatNumberString(hours * 60 / num_blocks) + ' min'} />
      <StatusEntry name='From height' value={formatNumberString(low_height)} />
      <StatusEntry name='To height' value={formatNumberString(high_height)} />
    </div>
  )
}

export default function Home() {
  const [status, queryStatus] = useTimelordStatus();
  const [summary, querySummary] = useTimelordSummary(24);
  useEffect(() => {
    ChartJS.register(ArcElement, Tooltip, Legend);

    queryStatus();
    querySummary();
  }, []);
  return (
    <main className='container p-2'>
      <Title />
      <Status {...status} />
      <Summary {...summary} />
    </main>
  );
}
