import React, { useState, useEffect } from "react";
import { Pie } from "@ant-design/charts";

export const PieRes = ({ question, dataObj }) => {
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

  console.log("PieData", data);
  const config = {
    autoFit: true,
    data,
    angleField: "value",
    colorField: "type",
    radius: 0.7,
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      style: {
        fontSize: 14,
        textAlign: "center",
      },
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };
  return (
    <div style={{ height: 300 }}>
      <Pie {...config} />
    </div>
  );
};
