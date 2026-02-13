import { render, screen, fireEvent } from "@testing-library/react";
import { DownloadPdfButton } from "../DownloadPdfButton";

const mockSave = vi.fn();
const mockOutput = vi.fn(() => "blob:mock-url");
const mockText = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetTextColor = vi.fn();

vi.mock("jspdf", () => ({
  default: class MockJsPDF {
    text = mockText;
    setFontSize = mockSetFontSize;
    setTextColor = mockSetTextColor;
    save = mockSave;
    output = mockOutput;
  },
}));

vi.mock("jspdf-autotable", () => ({
  default: vi.fn(),
}));

const mockEntries = [
  { date: "2026-01-15", name: "Rajesh", type: "income" as const, amount: 5000, description: "Donation" },
];

const mockSummary = { totalIncome: 5000, totalExpenditure: 0, netTotal: 5000 };

describe("DownloadPdfButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders preview and download buttons", () => {
    render(
      <DownloadPdfButton entries={mockEntries} summary={mockSummary} eventName="Test Event" />
    );
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("calls doc.save on download click", () => {
    render(
      <DownloadPdfButton entries={mockEntries} summary={mockSummary} eventName="Test Event" />
    );
    fireEvent.click(screen.getByText("Download"));
    expect(mockSave).toHaveBeenCalledWith("test-event-report.pdf");
  });

  it("opens preview in new window", () => {
    const mockOpen = vi.fn();
    vi.stubGlobal("open", mockOpen);

    render(
      <DownloadPdfButton entries={mockEntries} summary={mockSummary} eventName="Test Event" />
    );
    fireEvent.click(screen.getByText("Preview"));
    expect(mockOutput).toHaveBeenCalledWith("bloburl");
    expect(mockOpen).toHaveBeenCalledWith("blob:mock-url", "_blank");

    vi.unstubAllGlobals();
  });
});
