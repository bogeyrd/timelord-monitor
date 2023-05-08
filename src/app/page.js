"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { SiBlockchaindotcom } from "react-icons/si";
import { FaChartPie } from "react-icons/fa";

function replaceUndefined(v) {
  if (typeof v === "undefined") {
    return "...";
  }
  return v;
}

function shortHashString(hash) {
  if (typeof hash === "string") {
    return hash.substring(0, 4) + "..." + hash.substring(hash.length - 4);
  }
  return replaceUndefined(hash);
}

function formatNumberString(n) {
  if (typeof n === "number") {
    return n.toLocaleString();
  }
  return replaceUndefined(n);
}

function Title() {
  return (
    <div className="flex flex-row bg-blue-200 p-1">
      <div className="text-xl font-bold w-auto">Timelord Status</div>
      <div className="text-xs text-right grow self-center">HOST: unavailable</div>
    </div>
  )
}

function StatusEntry({ name, value }) {
  return (
    <div className="p-1 text-sm flex flex-row">
      <div className="font-bold">{name}</div><div className="font-mono text-right grow">{replaceUndefined(value)}</div>
    </div>
  )
}

function SectionTitle({ title }) {
  return (
    <div className="text-xs italic pl-2">{title}</div>
  )
}

function LastBlockInfo({ height, address, reward, accumulate, filter_bits, vdf_time, vdf_iters, vdf_speed, challenge_difficulty, block_difficulty }) {
  return (
    <div>
      <div className="flex flex-row pl-1 pt-4 pb-1">
        <SiBlockchaindotcom />
        <SectionTitle title="Last block information" />
      </div>
      <StatusEntry name="Height" value={formatNumberString(height)} />
      <StatusEntry name="Miner" value={address} />
      <StatusEntry name="Reward" value={replaceUndefined(reward) + " BHD"} />
      <StatusEntry name="Accumulate" value={formatNumberString(accumulate) + " BHD"} />
      <StatusEntry name="Filter-bit" value={filter_bits} />
      <StatusEntry name="VDF speed" value={formatNumberString(vdf_speed)} />
      <StatusEntry name="VDF time" value={vdf_time} />
      <StatusEntry name="VDF iterations" value={formatNumberString(vdf_iters)} />
      <StatusEntry name="Challenge difficulty" value={formatNumberString(challenge_difficulty)} />
      <StatusEntry name="Block difficulty" value={formatNumberString(block_difficulty)} />
    </div>
  )
}

// function SummaryChart() {
//   return (
//     <div>
//       <div className="flex flex-row pl-1 pt-4 pb-1">
//         <FaChartPie />
//         <SectionTitle title="Blocks in 24 hours" />
//       </div>
//     </div>
//   )
// }

function Status({ challenge, height, iters_per_sec, total_size, last_block_info }) {
  return (
    <div className="bg-gray-50 p-1">
      <StatusEntry name="Challenge" value={shortHashString(challenge)} />
      <StatusEntry name="VDF speed" value={replaceUndefined(iters_per_sec) + " ips"} />
      <StatusEntry name="Incoming height" value={formatNumberString(height)} />
      <StatusEntry name="Netspace" value={total_size} />
      <hr />
      <LastBlockInfo {...last_block_info} />
    </div>
  )
}

function Summary({num_blocks}) {
  return (
    <div className="bg-gray-50 p-1">
      <div className="flex flex-row pl-1 pt-4 pb-1">
        <FaChartPie />
        <SectionTitle title="Blocks in 24 hours" />
      </div>
      <StatusEntry name="Blocks" value={formatNumberString(num_blocks)} />
      <StatusEntry name="Avg min/block" value={formatNumberString(24 * 60 / num_blocks) + " min"} />
    </div>
  )
}

export default function Home() {
  const [status, setStatus] = useState();
  const [summary, setSummary] = useState();
  useEffect(function () {
    axios.get("http://localhost:39393/api/status?rn=" + Math.random()).then(function (res) {
      setStatus(res.data);
    });
    axios.get("http://localhost:39393/api/summary?hours=24&rn=" + Math.random()).then(function (res) {
      setSummary(res.data);
    });
  }, []);
  return (
    <main className="container p-2">
      <Title />
      <Status {...status} />
      <hr />
      <Summary {...summary} />
    </main>
  );
}
