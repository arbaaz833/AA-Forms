import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Bar } from "@ant-design/charts";

export const BarRes = ({ question, dataObj }) => {
  let data = [];
  let currOpts = [];

  if (question !== null) {
    question.options.forEach((opt) => currOpts.push(opt.text));
    for (let key in dataObj) {
      if (!currOpts.includes(key) && dataObj[key] == 0) {
      } else data.push({ type: key, value: dataObj[key] });
    }
  } else {
    for (let key in dataObj) {
      data.push({ type: key, value: dataObj[key] });
    }
  }

  console.log("barChart Data", data);

  const config = {
    data,
    xField: "value",
    yField: "type",
    colorField: "type",
    color: ["#ffc13b", "#1e3d59", "#ff6e40", "#533D2B", "#C8AAA0", "#926D57"],
    seriesField: "type",
    legend: {
      position: "top-left",
    },
  };
  return (
    <div style={{ height: 300 }}>
      <Bar {...config} />
    </div>
  );
};
