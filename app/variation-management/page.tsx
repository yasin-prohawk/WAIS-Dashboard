"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDashboardNav } from "@/components/dashboard-nav-provider";

declare global {
  interface Window {
    Chart: any;
    XLSX: any;
  }
}

/* ─── VM DATA ────────────────────────────── */
const MONTHS_12 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Full year data (Jan - Dec)
const FULL_YEAR_DATA = {
  totalItems: 97,
  tcPassed: 13,
  tcFailed: 0,
  tcCancelled: 0,
  variationStatus: [
    { label: "Submitted by Company", count: 97, color: "#0EA5E9" },
    { label: "Verified by Hospital Engineer", count: 85, color: "#F59E0B" },
    { label: "Approved by Hospital Director", count: 72, color: "#10B981" },
    { label: "Verified by Company HQ", count: 68, color: "#8B5CF6" },
    { label: "Approved by State", count: 45, color: "#6F42C1" },
  ],
  monthlyTrend: {
    "Jan": { submitted: 0, verified: 0, approved: 0, hqVerified: 0, stateApproved: 0 },
    "Feb": { submitted: 1, verified: 1, approved: 0, hqVerified: 0, stateApproved: 0 },
    "Mar": { submitted: 2, verified: 2, approved: 1, hqVerified: 0, stateApproved: 0 },
    "Apr": { submitted: 3, verified: 3, approved: 2, hqVerified: 1, stateApproved: 0 },
    "May": { submitted: 4, verified: 4, approved: 3, hqVerified: 2, stateApproved: 1 },
    "Jun": { submitted: 5, verified: 5, approved: 4, hqVerified: 3, stateApproved: 2 },
    "Jul": { submitted: 6, verified: 6, approved: 5, hqVerified: 4, stateApproved: 3 },
    "Aug": { submitted: 7, verified: 7, approved: 6, hqVerified: 5, stateApproved: 4 },
    "Sep": { submitted: 8, verified: 8, approved: 7, hqVerified: 6, stateApproved: 5 },
    "Oct": { submitted: 9, verified: 9, approved: 8, hqVerified: 7, stateApproved: 6 },
    "Nov": { submitted: 10, verified: 10, approved: 9, hqVerified: 8, stateApproved: 7 },
    "Dec": { submitted: 11, verified: 11, approved: 10, hqVerified: 9, stateApproved: 8 },
  },
  feeSummary: {
    dwSummary: 67.85,
    pwSummary: 67.85,
    additionalFee: 135.7,
    omissionFee: -2366.3,
    totalFee: -2230.6,
  },
  categories: [
    { label: "CL Count", count: 25, color: "#0EA5E9" },
    { label: "BEMS Equipment", count: 18, color: "#F59E0B" },
    { label: "FEMS Equipment & Vehicles", count: 15, color: "#10B981" },
    { label: "FEMS System", count: 20, color: "#8B5CF6" },
    { label: "FEMS Building", count: 12, color: "#EF4444" },
    { label: "FEMS Land Area", count: 7, color: "#6F42C1" },
  ],
};

// H1 Data (Jan - Jun)
const H1_DATA = {
  totalItems: 45,
  tcPassed: 8,
  tcFailed: 0,
  tcCancelled: 0,
  variationStatus: [
    { label: "Submitted by Company", count: 45, color: "#0EA5E9" },
    { label: "Verified by Hospital Engineer", count: 40, color: "#F59E0B" },
    { label: "Approved by Hospital Director", count: 32, color: "#10B981" },
    { label: "Verified by Company HQ", count: 28, color: "#8B5CF6" },
    { label: "Approved by State", count: 18, color: "#6F42C1" },
  ],
  monthlyTrend: {
    "Jan": { submitted: 0, verified: 0, approved: 0, hqVerified: 0, stateApproved: 0 },
    "Feb": { submitted: 1, verified: 1, approved: 0, hqVerified: 0, stateApproved: 0 },
    "Mar": { submitted: 2, verified: 2, approved: 1, hqVerified: 0, stateApproved: 0 },
    "Apr": { submitted: 3, verified: 3, approved: 2, hqVerified: 1, stateApproved: 0 },
    "May": { submitted: 4, verified: 4, approved: 3, hqVerified: 2, stateApproved: 1 },
    "Jun": { submitted: 5, verified: 5, approved: 4, hqVerified: 3, stateApproved: 2 },
  },
  feeSummary: {
    dwSummary: 35.20,
    pwSummary: 35.20,
    additionalFee: 70.4,
    omissionFee: -1200.5,
    totalFee: -1130.1,
  },
  categories: [
    { label: "CL Count", count: 12, color: "#0EA5E9" },
    { label: "BEMS Equipment", count: 8, color: "#F59E0B" },
    { label: "FEMS Equipment & Vehicles", count: 7, color: "#10B981" },
    { label: "FEMS System", count: 10, color: "#8B5CF6" },
    { label: "FEMS Building", count: 5, color: "#EF4444" },
    { label: "FEMS Land Area", count: 3, color: "#6F42C1" },
  ],
};

// H2 Data (Jul - Dec)
const H2_DATA = {
  totalItems: 52,
  tcPassed: 5,
  tcFailed: 0,
  tcCancelled: 0,
  variationStatus: [
    { label: "Submitted by Company", count: 52, color: "#0EA5E9" },
    { label: "Verified by Hospital Engineer", count: 45, color: "#F59E0B" },
    { label: "Approved by Hospital Director", count: 40, color: "#10B981" },
    { label: "Verified by Company HQ", count: 40, color: "#8B5CF6" },
    { label: "Approved by State", count: 27, color: "#6F42C1" },
  ],
  monthlyTrend: {
    "Jul": { submitted: 0, verified: 0, approved: 0, hqVerified: 0, stateApproved: 0 },
    "Aug": { submitted: 1, verified: 1, approved: 0, hqVerified: 0, stateApproved: 0 },
    "Sep": { submitted: 2, verified: 2, approved: 1, hqVerified: 0, stateApproved: 0 },
    "Oct": { submitted: 3, verified: 3, approved: 2, hqVerified: 1, stateApproved: 0 },
    "Nov": { submitted: 4, verified: 4, approved: 3, hqVerified: 2, stateApproved: 1 },
    "Dec": { submitted: 5, verified: 5, approved: 4, hqVerified: 3, stateApproved: 2 },
  },
  feeSummary: {
    dwSummary: 32.65,
    pwSummary: 32.65,
    additionalFee: 65.3,
    omissionFee: -1165.8,
    totalFee: -1100.5,
  },
  categories: [
    { label: "CL Count", count: 13, color: "#0EA5E9" },
    { label: "BEMS Equipment", count: 10, color: "#F59E0B" },
    { label: "FEMS Equipment & Vehicles", count: 8, color: "#10B981" },
    { label: "FEMS System", count: 10, color: "#8B5CF6" },
    { label: "FEMS Building", count: 7, color: "#EF4444" },
    { label: "FEMS Land Area", count: 4, color: "#6F42C1" },
  ],
};

// Monthly data for each month
const MONTHLY_DATA: Record<string, any> = {
  "Jan": {
    totalItems: 8,
    tcPassed: 1,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 8, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 6, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 4, color: "#10B981" },
      { label: "Verified by Company HQ", count: 3, color: "#8B5CF6" },
      { label: "Approved by State", count: 1, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Jan": { submitted: 8, verified: 6, approved: 4, hqVerified: 3, stateApproved: 1 },
    },
    feeSummary: {
      dwSummary: 12.50,
      pwSummary: 12.50,
      additionalFee: 25.0,
      omissionFee: -210.5,
      totalFee: -185.5,
    },
    categories: [
      { label: "CL Count", count: 2, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 1, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 1, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Feb": {
    totalItems: 5,
    tcPassed: 0,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 5, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 4, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 2, color: "#10B981" },
      { label: "Verified by Company HQ", count: 1, color: "#8B5CF6" },
      { label: "Approved by State", count: 0, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Feb": { submitted: 5, verified: 4, approved: 2, hqVerified: 1, stateApproved: 0 },
    },
    feeSummary: {
      dwSummary: 8.20,
      pwSummary: 8.20,
      additionalFee: 16.4,
      omissionFee: -150.2,
      totalFee: -133.8,
    },
    categories: [
      { label: "CL Count", count: 1, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 1, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 0, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 0, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Mar": {
    totalItems: 10,
    tcPassed: 2,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 10, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 9, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 7, color: "#10B981" },
      { label: "Verified by Company HQ", count: 5, color: "#8B5CF6" },
      { label: "Approved by State", count: 3, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Mar": { submitted: 10, verified: 9, approved: 7, hqVerified: 5, stateApproved: 3 },
    },
    feeSummary: {
      dwSummary: 15.30,
      pwSummary: 15.30,
      additionalFee: 30.6,
      omissionFee: -280.4,
      totalFee: -249.8,
    },
    categories: [
      { label: "CL Count", count: 3, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 2, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 1, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Apr": {
    totalItems: 7,
    tcPassed: 1,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 7, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 6, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 5, color: "#10B981" },
      { label: "Verified by Company HQ", count: 4, color: "#8B5CF6" },
      { label: "Approved by State", count: 2, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Apr": { submitted: 7, verified: 6, approved: 5, hqVerified: 4, stateApproved: 2 },
    },
    feeSummary: {
      dwSummary: 10.80,
      pwSummary: 10.80,
      additionalFee: 21.6,
      omissionFee: -195.3,
      totalFee: -173.7,
    },
    categories: [
      { label: "CL Count", count: 2, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 1, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 0, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "May": {
    totalItems: 12,
    tcPassed: 2,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 12, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 11, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 9, color: "#10B981" },
      { label: "Verified by Company HQ", count: 8, color: "#8B5CF6" },
      { label: "Approved by State", count: 5, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "May": { submitted: 12, verified: 11, approved: 9, hqVerified: 8, stateApproved: 5 },
    },
    feeSummary: {
      dwSummary: 18.40,
      pwSummary: 18.40,
      additionalFee: 36.8,
      omissionFee: -340.6,
      totalFee: -303.8,
    },
    categories: [
      { label: "CL Count", count: 3, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 2, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 2, color: "#10B981" },
      { label: "FEMS System", count: 3, color: "#8B5CF6" },
      { label: "FEMS Building", count: 1, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Jun": {
    totalItems: 3,
    tcPassed: 2,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 3, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 3, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 2, color: "#10B981" },
      { label: "Verified by Company HQ", count: 1, color: "#8B5CF6" },
      { label: "Approved by State", count: 0, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Jun": { submitted: 3, verified: 3, approved: 2, hqVerified: 1, stateApproved: 0 },
    },
    feeSummary: {
      dwSummary: 4.50,
      pwSummary: 4.50,
      additionalFee: 9.0,
      omissionFee: -85.2,
      totalFee: -76.2,
    },
    categories: [
      { label: "CL Count", count: 1, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 0, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 1, color: "#8B5CF6" },
      { label: "FEMS Building", count: 0, color: "#EF4444" },
      { label: "FEMS Land Area", count: 0, color: "#6F42C1" },
    ],
  },
  "Jul": {
    totalItems: 9,
    tcPassed: 1,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 9, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 8, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 6, color: "#10B981" },
      { label: "Verified by Company HQ", count: 4, color: "#8B5CF6" },
      { label: "Approved by State", count: 2, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Jul": { submitted: 9, verified: 8, approved: 6, hqVerified: 4, stateApproved: 2 },
    },
    feeSummary: {
      dwSummary: 13.70,
      pwSummary: 13.70,
      additionalFee: 27.4,
      omissionFee: -248.9,
      totalFee: -221.5,
    },
    categories: [
      { label: "CL Count", count: 2, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 2, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 1, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Aug": {
    totalItems: 6,
    tcPassed: 0,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 6, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 5, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 4, color: "#10B981" },
      { label: "Verified by Company HQ", count: 3, color: "#8B5CF6" },
      { label: "Approved by State", count: 1, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Aug": { submitted: 6, verified: 5, approved: 4, hqVerified: 3, stateApproved: 1 },
    },
    feeSummary: {
      dwSummary: 9.20,
      pwSummary: 9.20,
      additionalFee: 18.4,
      omissionFee: -167.3,
      totalFee: -148.9,
    },
    categories: [
      { label: "CL Count", count: 1, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 1, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 0, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Sep": {
    totalItems: 11,
    tcPassed: 1,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 11, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 10, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 8, color: "#10B981" },
      { label: "Verified by Company HQ", count: 7, color: "#8B5CF6" },
      { label: "Approved by State", count: 4, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Sep": { submitted: 11, verified: 10, approved: 8, hqVerified: 7, stateApproved: 4 },
    },
    feeSummary: {
      dwSummary: 16.80,
      pwSummary: 16.80,
      additionalFee: 33.6,
      omissionFee: -305.7,
      totalFee: -272.1,
    },
    categories: [
      { label: "CL Count", count: 3, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 2, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 3, color: "#8B5CF6" },
      { label: "FEMS Building", count: 1, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Oct": {
    totalItems: 4,
    tcPassed: 0,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 4, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 3, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 2, color: "#10B981" },
      { label: "Verified by Company HQ", count: 1, color: "#8B5CF6" },
      { label: "Approved by State", count: 0, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Oct": { submitted: 4, verified: 3, approved: 2, hqVerified: 1, stateApproved: 0 },
    },
    feeSummary: {
      dwSummary: 6.10,
      pwSummary: 6.10,
      additionalFee: 12.2,
      omissionFee: -111.4,
      totalFee: -99.2,
    },
    categories: [
      { label: "CL Count", count: 1, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 0, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 1, color: "#10B981" },
      { label: "FEMS System", count: 1, color: "#8B5CF6" },
      { label: "FEMS Building", count: 0, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Nov": {
    totalItems: 10,
    tcPassed: 2,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 10, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 9, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 8, color: "#10B981" },
      { label: "Verified by Company HQ", count: 7, color: "#8B5CF6" },
      { label: "Approved by State", count: 3, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Nov": { submitted: 10, verified: 9, approved: 8, hqVerified: 7, stateApproved: 3 },
    },
    feeSummary: {
      dwSummary: 15.30,
      pwSummary: 15.30,
      additionalFee: 30.6,
      omissionFee: -278.6,
      totalFee: -248.0,
    },
    categories: [
      { label: "CL Count", count: 2, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 2, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 2, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 1, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
  "Dec": {
    totalItems: 12,
    tcPassed: 1,
    tcFailed: 0,
    tcCancelled: 0,
    variationStatus: [
      { label: "Submitted by Company", count: 12, color: "#0EA5E9" },
      { label: "Verified by Hospital Engineer", count: 10, color: "#F59E0B" },
      { label: "Approved by Hospital Director", count: 8, color: "#10B981" },
      { label: "Verified by Company HQ", count: 8, color: "#8B5CF6" },
      { label: "Approved by State", count: 5, color: "#6F42C1" },
    ],
    monthlyTrend: {
      "Dec": { submitted: 12, verified: 10, approved: 8, hqVerified: 8, stateApproved: 5 },
    },
    feeSummary: {
      dwSummary: 18.40,
      pwSummary: 18.40,
      additionalFee: 36.8,
      omissionFee: -334.2,
      totalFee: -297.4,
    },
    categories: [
      { label: "CL Count", count: 3, color: "#0EA5E9" },
      { label: "BEMS Equipment", count: 3, color: "#F59E0B" },
      { label: "FEMS Equipment & Vehicles", count: 2, color: "#10B981" },
      { label: "FEMS System", count: 2, color: "#8B5CF6" },
      { label: "FEMS Building", count: 1, color: "#EF4444" },
      { label: "FEMS Land Area", count: 1, color: "#6F42C1" },
    ],
  },
};

/* ─── THEMES ────────────────────────────────────── */
const THEMES = {
  dark: {
    bg: "#0d1520",
    card: "#162233",
    cardAlt: "#1a2a3f",
    border: "#1e3248",
    text: "#e0e7ff",
    muted: "#8a9cb8",
    accent: "#5a9fd4",
    success: "#22c55e",
    warn: "#f59e0b",
    danger: "#ef4444",
    gridColor: "rgba(255,255,255,0.07)",
    tickColor: "#6b8099",
    scrollThumb: "#2a3f55",
    tableHeaderBg: "rgba(90,159,212,0.08)",
    gradientStart: "#0d1a27",
    gradientEnd: "#162233",
  },
  light: {
    bg: "#f0f4f8",
    card: "#ffffff",
    cardAlt: "#f8fafc",
    border: "#dde3ed",
    text: "#1a2636",
    muted: "#6b7fa3",
    accent: "#1a6bb5",
    success: "#16a34a",
    warn: "#d97706",
    danger: "#dc2626",
    gridColor: "rgba(0,0,0,0.06)",
    tickColor: "#8a9cb8",
    scrollThumb: "#c5cfe0",
    tableHeaderBg: "rgba(26,107,181,0.06)",
    gradientStart: "#e8edf5",
    gradientEnd: "#f0f4f8",
  },
};

type Theme = typeof THEMES.dark;

/* ─── CHART HELPERS ─────────────────────────────── */
function drawChart(id: string, type: string, data: any, options: any) {
  const c = document.getElementById(id) as HTMLCanvasElement | null;
  if (!c) return;
  if (!window.Chart) { setTimeout(() => drawChart(id, type, data, options), 150); return; }
  const ctx = c.getContext("2d");
  if (!ctx) return;
  const ex = window.Chart.getChart(c);
  if (ex) ex.destroy();
  try {
    new window.Chart(ctx, { type: type as any, data, options: { ...options, animation: false, responsive: true, maintainAspectRatio: false } });
  } catch (e) { }
}

function mkBar(id: string, labels: string[], datasets: any[], T: Theme, extra?: any) {
  const scales: any = {
    x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } },
    y: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } }
  };
  if (extra?.stacked) {
    scales.x.stacked = true;
    scales.y.stacked = true;
  }
  drawChart(id, "bar", { labels, datasets }, { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        display: true, 
        position: "bottom" as const, 
        labels: { 
          color: T.muted, 
          font: { size: 9 }, 
          boxWidth: 10, 
          padding: 8, 
          usePointStyle: true 
        } 
      } 
    },
    scales,
    ...extra 
  });
}

function mkLine(id: string, labels: string[], datasets: any[], T: Theme, extra?: any) {
  const yticks: any = { color: T.tickColor, font: { size: 10 } };
  const opts: any = {
    plugins: { 
      legend: { 
        display: true, 
        position: "bottom" as const, 
        labels: { 
          color: T.muted, 
          font: { size: 9 }, 
          boxWidth: 10, 
          padding: 8, 
          usePointStyle: true 
        } 
      } 
    },
    scales: {
      x: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } },
      y: { grid: { color: T.gridColor }, ticks: { color: T.tickColor, font: { size: 10 } }, border: { color: "transparent" } }
    }
  };
  if (extra?.scales?.y?.callback) yticks.callback = extra.scales.y.callback;
  opts.scales.y.ticks = yticks;
  drawChart(id, "line", { labels, datasets: datasets.map((d: any) => ({ ...d, borderWidth: d.borderWidth || 2, pointRadius: d.pointRadius || 3, tension: d.tension || 0.35, fill: false })) }, opts);
}

/* ─── EXPORT ─────────────────────────────────────── */
function exportExcelVM(data: any, period: string) {
  if (!window.XLSX) return;
  const wb = window.XLSX.utils.book_new();
  const sheetData: any[][] = [
    ["Variation Management Dashboard", period],
    [],
    ["Total Items", data.totalItems],
    ["T&C Passed", data.tcPassed],
    ["T&C Failed", data.tcFailed],
    ["T&C Cancelled", data.tcCancelled],
    [],
    ["Variation Status Summary"],
    ["Status", "Count"]
  ];
  data.variationStatus.forEach((s: any) => sheetData.push([s.label, s.count]));
  sheetData.push([], ["Fee Summary"]);
  sheetData.push(["DW Summary", "RM " + data.feeSummary.dwSummary.toFixed(2)]);
  sheetData.push(["PW Summary", "RM " + data.feeSummary.pwSummary.toFixed(2)]);
  sheetData.push(["Additional Fee", "RM " + data.feeSummary.additionalFee.toFixed(2)]);
  sheetData.push(["Omission Fee", "RM " + data.feeSummary.omissionFee.toFixed(2)]);
  sheetData.push(["Total Fee", "RM " + data.feeSummary.totalFee.toFixed(2)]);
  const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
  window.XLSX.utils.book_append_sheet(wb, ws, "VM_Summary");
  window.XLSX.writeFile(wb, `VM_Dashboard_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function printPage() {
  const s = document.createElement('style');
  s.id = 'ps';
  s.textContent = '@page{size:A4 landscape;margin:10mm}@media print{body{-webkit-print-color-adjust:exact!important}.no-print{display:none!important}}';
  document.head.appendChild(s);
  window.print();
  setTimeout(() => { const e = document.getElementById('ps'); if (e) e.remove(); }, 1000);
}

/* ─── COMPONENTS ────────────────────────────────── */
function BIcon({ name, size = 16, color }: { name: string; size?: number; color?: string }) {
  return <i className={`bi ${name}`} style={{ fontSize: size, color: color || "inherit", lineHeight: 1 }} />;
}

function Badge({ children, color = "green", T }: { children: string; color?: string; T: Theme }) {
  const m: Record<string, string> = { green: "rgba(16,185,129,.12)", warn: "rgba(217,119,6,.12)", danger: "rgba(220,38,38,.12)", blue: "rgba(26,107,181,.12)" };
  const tc: Record<string, string> = { green: T.success, warn: T.warn, danger: T.danger, blue: T.accent };
  return <span style={{ background: m[color], color: tc[color], padding: "4px 12px", borderRadius: 24, fontSize: 11, fontWeight: 700 }}>{children}</span>;
}

function getContrastText(h: string) {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? "#ffffff" : "#ffffff";
}

/* ─── MAIN ──────────────────────────────────────── */
export default function VMDashboard() {
  const { openSidebar } = useDashboardNav();
  const [themeName, setThemeName] = useState<"dark" | "light">("light");
  const [frequency, setFrequency] = useState("yearly");
  const [frequencyKey, setFrequencyKey] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [viewMode, setViewMode] = useState<"count" | "area">("count");
  const T = THEMES[themeName];
  const scriptsReady = useRef(false);
  const chartsInited = useRef(false);
  const HDR = "#0f172a";
  const htc = getContrastText(HDR);

  const years = ["2026", "2025", "2024", "2023", "2022"];
  
  // Frequency Key options based on Frequency selection
  const getFrequencyKeys = () => {
    if (frequency === "monthly") {
      return MONTHS_12.map(m => ({ value: m.toLowerCase(), label: m }));
    } else if (frequency === "halfYearly") {
      return [
        { value: "H1", label: "H1 (Jan - Jun)" },
        { value: "H2", label: "H2 (Jul - Dec)" }
      ];
    } else {
      return [{ value: "all", label: "Full Year" }];
    }
  };

  const frequencyKeys = getFrequencyKeys();

  // Get data based on frequency and frequencyKey
  const getData = () => {
    if (frequency === "monthly") {
      const monthKey = frequencyKey.charAt(0).toUpperCase() + frequencyKey.slice(1);
      return MONTHLY_DATA[monthKey] || FULL_YEAR_DATA;
    } else if (frequency === "halfYearly") {
      if (frequencyKey === "H1") return H1_DATA;
      if (frequencyKey === "H2") return H2_DATA;
      return FULL_YEAR_DATA;
    } else {
      return FULL_YEAR_DATA;
    }
  };

  const currentData = getData();
  
  // Get period label for display
  const getPeriodLabel = () => {
    if (frequency === "monthly") {
      const monthKey = frequencyKey.charAt(0).toUpperCase() + frequencyKey.slice(1);
      return `${monthKey} ${selectedYear}`;
    } else if (frequency === "halfYearly") {
      return `${frequencyKey} - ${selectedYear}`;
    } else {
      return `Full Year ${selectedYear}`;
    }
  };

  const periodLabel = getPeriodLabel();
  const fmtRM = (n: number) => "RM " + n.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    if (scriptsReady.current) return;
    const load = (src: string, cb: () => void) => { const s = document.createElement("script"); s.src = src; s.onload = cb; document.head.appendChild(s); };
    load("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js", () => {
      load("https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js", () => {
        scriptsReady.current = true;
        setTimeout(() => { initCharts(); chartsInited.current = true; }, 400);
      });
    });
  }, []);

  useEffect(() => {
    if (scriptsReady.current && chartsInited.current) setTimeout(initCharts, 200);
  }, [themeName, viewMode, frequency, frequencyKey, currentData]);

  const initCharts = () => {
    if (!window.Chart) { setTimeout(initCharts, 200); return; }

    ["vmStatusChart", "vmTrendChart", "vmCategoryChart", "vmFeeChart"].forEach(id => {
      const c = document.getElementById(id) as HTMLCanvasElement;
      if (c) { const ex = window.Chart.getChart(c); if (ex) ex.destroy(); }
    });

    // Status Chart - Variation Verification Process Status
    const statusColors = currentData.variationStatus.map((s: any) => s.color);
    mkBar("vmStatusChart",
      currentData.variationStatus.map((s: any) => s.label),
      currentData.variationStatus.map((s: any) => s.count),
      statusColors,
      T, 
      { indexAxis: "y" as const, borderRadius: 6 }
    );

    // Trend Chart - Monthly Variation Submission Status
    const months = Object.keys(currentData.monthlyTrend);
    const trendDatasets = [
      {
        label: "Submitted by Company",
        data: months.map((m: string) => currentData.monthlyTrend[m].submitted),
        borderColor: "#0EA5E9",
        backgroundColor: "#0EA5E9",
        pointBackgroundColor: "#0EA5E9",
      },
      {
        label: "Verified by Hospital Engineer",
        data: months.map((m: string) => currentData.monthlyTrend[m].verified),
        borderColor: "#F59E0B",
        backgroundColor: "#F59E0B",
        pointBackgroundColor: "#F59E0B",
      },
      {
        label: "Approved by Hospital Director",
        data: months.map((m: string) => currentData.monthlyTrend[m].approved),
        borderColor: "#10B981",
        backgroundColor: "#10B981",
        pointBackgroundColor: "#10B981",
      },
      {
        label: "Verified by Company HQ",
        data: months.map((m: string) => currentData.monthlyTrend[m].hqVerified),
        borderColor: "#8B5CF6",
        backgroundColor: "#8B5CF6",
        pointBackgroundColor: "#8B5CF6",
      },
      {
        label: "Approved by State",
        data: months.map((m: string) => currentData.monthlyTrend[m].stateApproved),
        borderColor: "#6F42C1",
        backgroundColor: "#6F42C1",
        pointBackgroundColor: "#6F42C1",
      },
    ];
    mkLine("vmTrendChart", months, trendDatasets, T, {
      scales: { 
        y: { 
          ticks: { callback: (v: number) => v } 
        } 
      }
    });

    // Category Chart
    mkBar("vmCategoryChart",
      currentData.categories.map((c: any) => c.label),
      currentData.categories.map((c: any) => c.count),
      currentData.categories.map((c: any) => c.color),
      T, 
      { borderRadius: 6, indexAxis: "y" as const }
    );

    // Fee Chart
    const feeData = [
      currentData.feeSummary.additionalFee,
      currentData.feeSummary.omissionFee,
    ];
    const feeLabels = ["Additional Fee", "Omission Fee"];
    const feeColors = ["#10B981", "#EF4444"];
    mkBar("vmFeeChart",
      feeLabels,
      feeData,
      feeColors,
      T, 
      { borderRadius: 6 }
    );
  };

  const card = (e?: React.CSSProperties): React.CSSProperties => ({ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, ...e });
  const thStyle: React.CSSProperties = { background: T.tableHeaderBg, color: T.accent, padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 12, borderBottom: `2px solid ${T.border}` };
  const tdStyle: React.CSSProperties = { padding: "10px 14px", borderBottom: `1px solid ${T.border}`, color: T.text };

  return (
    <div className="dashboard-module-page" style={{ fontFamily: "'DM Sans',system-ui,sans-serif", background: T.bg, color: T.text, fontSize: 15, height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        *, ::-webkit-scrollbar { scrollbar-width: thin; scrollbar-color: ${T.scrollThumb} transparent }
        ::-webkit-scrollbar { width: 5px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: ${T.scrollThumb}; border-radius: 99px }
        @page { size: A4 landscape; margin: 10mm }
        @media print { body { -webkit-print-color-adjust: exact !important } .no-print { display: none !important } }
      `}</style>

      {/* TOP BAR */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 24px", height: 62, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={openSidebar} style={{ background: "transparent", border: "none", color: htc, cursor: "pointer", fontSize: 20, padding: "8px 11px", borderRadius: 10 }}><BIcon name="bi-list" size={22} color={htc} /></button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: `1px solid ${htc}30`, color: htc, textDecoration: "none", fontSize: 13, fontWeight: 500 }}><BIcon name="bi-arrow-left" size={16} color={htc} /><span>Back</span></Link>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: htc }}>Variation Management</div>
            <div style={{ fontSize: 11, color: htc, opacity: 0.6 }}>VM Performance Dashboard</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => exportExcelVM(currentData, periodLabel)} title="Export" style={{ background: T.success + "12", border: `1px solid ${T.success}25`, color: T.success, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-download" size={15} color={T.success} /></button>
            <button onClick={printPage} title="Print" style={{ background: T.accent + "12", border: `1px solid ${T.accent}25`, color: T.accent, width: 34, height: 34, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="bi-printer" size={15} color={T.accent} /></button>
          </div>
          <div style={{ width: 1, height: 28, background: htc, opacity: 0.12 }} />
          <button onClick={() => setThemeName(n => n === "dark" ? "light" : "dark")} style={{ background: "transparent", border: `1px solid ${htc}20`, color: htc, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}><BIcon name={themeName === "dark" ? "bi-sun-fill" : "bi-moon-fill"} size={15} color={htc} /></button>
          <span style={{ fontSize: 13, color: htc, opacity: 0.7 }}>18 May 2026</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", background: htc + "08", borderRadius: 24, border: `1px solid ${htc}20` }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}><BIcon name="bi-person-fill" size={13} color="#fff" /></div>
            <span style={{ fontSize: 13, fontWeight: 600, color: htc }}>Admin</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", background: HDR, borderBottom: `1px solid ${htc}15`, padding: "0 22px", height: 54, gap: 16, flexShrink: 0, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Level</span>
          <select style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <option>All Levels</option>
            <option>Critical</option>
            <option>Non-Critical</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency</span>
          <select 
            value={frequency} 
            onChange={e => { 
              setFrequency(e.target.value); 
              if (e.target.value === "yearly") setFrequencyKey("all");
              if (e.target.value === "halfYearly") setFrequencyKey("H1");
              if (e.target.value === "monthly") setFrequencyKey("jan");
            }} 
            style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
          >
            <option value="monthly">Monthly</option>
            <option value="halfYearly">Half Yearly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Frequency Key</span>
          <select 
            value={frequencyKey} 
            onChange={e => setFrequencyKey(e.target.value)} 
            style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
          >
            {frequencyKeys.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Year</span>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ background: "#fff", color: "#1a2636", padding: "6px 30px 6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>View</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setViewMode("count")} style={{ padding: "4px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: viewMode === "count" ? "#0EA5E9" : "rgba(255,255,255,0.08)", color: viewMode === "count" ? "#fff" : "rgba(255,255,255,0.7)", border: viewMode === "count" ? "1px solid #0EA5E9" : "1px solid rgba(255,255,255,0.15)" }}>Count</button>
            <button onClick={() => setViewMode("area")} style={{ padding: "4px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: viewMode === "area" ? "#0EA5E9" : "rgba(255,255,255,0.08)", color: viewMode === "area" ? "#fff" : "rgba(255,255,255,0.7)", border: viewMode === "area" ? "1px solid #0EA5E9" : "1px solid rgba(255,255,255,0.15)" }}>Area Size</button>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.15)" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Period</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{periodLabel}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>

        {/* ── KPI CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #0EA5E9`, background: `linear-gradient(135deg, #0EA5E908, ${T.card})` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>Total Items by T&C</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#0EA5E9", marginTop: 4 }}>{currentData.totalItems}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0EA5E915", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-clipboard-data" size={20} color="#0EA5E9" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #10B981` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>T&C Passed</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#10B981", marginTop: 4 }}>{currentData.tcPassed}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#10B98115", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-check-circle" size={20} color="#10B981" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #F59E0B` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>T&C Failed</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#F59E0B", marginTop: 4 }}>{currentData.tcFailed}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F59E0B15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-x-circle" size={20} color="#F59E0B" />
              </div>
            </div>
          </div>
          <div style={{ ...card({ padding: "18px 20px" }), borderLeft: `4px solid #EF4444` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.3px" }}>T&C Cancelled</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: "#EF4444", marginTop: 4 }}>{currentData.tcCancelled}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EF444415", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="bi-ban" size={20} color="#EF4444" />
              </div>
            </div>
          </div>
        </div>

        {/* ── STATUS & TREND CHARTS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Variation Verification Process Status</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{periodLabel}</div>
            </div>
            <div style={{ position: "relative", height: 280, marginTop: 8 }}><canvas id="vmStatusChart" /></div>
          </div>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Variation Submission Status Trend</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{periodLabel}</div>
            </div>
            <div style={{ position: "relative", height: 280, marginTop: 8 }}><canvas id="vmTrendChart" /></div>
          </div>
        </div>

        {/* ── CATEGORY & FEE CHARTS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Total Item by Category</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{periodLabel}</div>
            </div>
            <div style={{ position: "relative", height: 260, marginTop: 8 }}><canvas id="vmCategoryChart" /></div>
          </div>
          <div style={card({ padding: "18px" })}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Fee Summary</span>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{periodLabel}</div>
            </div>
            <div style={{ position: "relative", height: 160, marginTop: 8 }}><canvas id="vmFeeChart" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }}>
              <div style={{ background: T.bg, borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: T.muted }}>DW Summary</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.success }}>{fmtRM(currentData.feeSummary.dwSummary)}</div>
              </div>
              <div style={{ background: T.bg, borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: T.muted }}>PW Summary</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.warn }}>{fmtRM(currentData.feeSummary.pwSummary)}</div>
              </div>
              <div style={{ background: T.bg, borderRadius: 8, padding: "10px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: T.muted }}>Total Fee</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: currentData.feeSummary.totalFee >= 0 ? T.success : T.danger }}>{fmtRM(currentData.feeSummary.totalFee)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATUS TABLE ── */}
        <div style={card({ padding: "18px" })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Variation Status Summary</span>
              <span style={{ fontSize: 10, color: T.muted, marginLeft: 12 }}>{periodLabel}</span>
            </div>
            <Badge color="blue" T={T}>Total: {currentData.totalItems} Items</Badge>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Status", "Count", "% of Total", "Status Indicator"].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentData.variationStatus.map((s: any) => (
                  <tr key={s.label} style={{ borderBottom: `1px solid ${T.border}`, transition: "background 0.15s" }} onMouseEnter={(e) => e.currentTarget.style.background = T.tableHeaderBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                        {s.label}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{s.count}</td>
                    <td style={tdStyle}>{currentData.totalItems > 0 ? ((s.count / currentData.totalItems) * 100).toFixed(1) : 0}%</td>
                    <td style={tdStyle}>
                      <Badge color={s.count > 50 ? "green" : s.count > 30 ? "warn" : "danger"} T={T}>
                        {s.count > 50 ? "High" : s.count > 30 ? "Medium" : "Low"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                <tr style={{ background: T.tableHeaderBg }}>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.text }}>TOTAL</td>
                  <td style={{ ...tdStyle, fontWeight: 800, color: T.accent }}>{currentData.totalItems}</td>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>100%</td>
                  <td style={tdStyle}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{ marginTop: 20, fontSize: 11, color: T.muted, textAlign: "center", padding: "12px 0", borderTop: `1px solid ${T.border}` }}>
          <BIcon name="bi-database" size={12} style={{ marginRight: 6 }} />
          Data based on Variation Management assessment · {periodLabel} · ASIS QMS
          <span style={{ margin: "0 12px" }}>|</span>
          <BIcon name="bi-clock" size={12} style={{ marginRight: 4 }} />
          Last updated: 18 May 2026
        </div>
      </div>
    </div>
  );
}