import {
  formatCurrency,
  formatDate,
  getTodayString,
  getTodayISO,
  isoToddmmyyyy,
  ddmmyyyyToISO,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats a positive amount in INR", () => {
    const result = formatCurrency(1500);
    // en-IN INR with 0 fraction digits => something like "₹1,500"
    expect(result).toContain("1,500");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats a large amount with Indian grouping", () => {
    const result = formatCurrency(1234567);
    // Indian numbering: 12,34,567
    expect(result).toContain("12,34,567");
  });

  it("formats a negative amount", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500");
  });
});

describe("formatDate", () => {
  it("formats a standard ISO date string to en-IN long format", () => {
    const result = formatDate("2024-08-15");
    // en-IN long format: "15 August 2024"
    expect(result).toContain("August");
    expect(result).toContain("2024");
    expect(result).toContain("15");
  });
});

describe("getTodayString", () => {
  it("returns today's date in dd/mm/yyyy format", () => {
    const mockDate = new Date(2025, 0, 5); // January 5, 2025
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const result = getTodayString();
    expect(result).toBe("05/01/2025");

    vi.useRealTimers();
  });
});

describe("getTodayISO", () => {
  it("returns today's date in yyyy-mm-dd format", () => {
    const mockDate = new Date("2025-03-22T12:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const result = getTodayISO();
    expect(result).toBe("2025-03-22");

    vi.useRealTimers();
  });
});

describe("isoToddmmyyyy", () => {
  it("converts ISO date to dd/mm/yyyy format", () => {
    expect(isoToddmmyyyy("2024-12-25")).toBe("25/12/2024");
  });
});

describe("ddmmyyyyToISO", () => {
  it("converts dd/mm/yyyy date to ISO format", () => {
    expect(ddmmyyyyToISO("25/12/2024")).toBe("2024-12-25");
  });
});
