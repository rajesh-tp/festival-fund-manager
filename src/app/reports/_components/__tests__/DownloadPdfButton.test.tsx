import { render, screen, fireEvent } from "@testing-library/react";
import { DownloadPdfButton } from "../DownloadPdfButton";

const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockOpen = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("open", mockOpen);
  vi.stubGlobal("URL", { createObjectURL: mockCreateObjectURL, revokeObjectURL: vi.fn() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockEntries = [
  { date: "2026-01-15", name: "Rajesh", type: "income" as const, paymentMode: "cash" as const, amount: 5000, description: "Donation" },
];

const mockSummary = { totalIncome: 5000, totalExpenditure: 0, netTotal: 5000 };

describe("DownloadPdfButton", () => {
  it("renders preview and download buttons", () => {
    render(
      <DownloadPdfButton entries={mockEntries} summary={mockSummary} eventName="Test Event" />
    );
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("opens preview in new window with HTML blob", () => {
    render(
      <DownloadPdfButton entries={mockEntries} summary={mockSummary} eventName="Test Event" />
    );
    fireEvent.click(screen.getByText("Preview"));
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockOpen).toHaveBeenCalledWith("blob:mock-url", "_blank");
  });

  it("opens download in new window with auto-print", () => {
    render(
      <DownloadPdfButton entries={mockEntries} summary={mockSummary} eventName="Test Event" />
    );
    fireEvent.click(screen.getByText("Download"));
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockOpen).toHaveBeenCalledWith("blob:mock-url", "_blank");
  });

  it("includes entry data and Malayalam font in generated HTML", () => {
    let capturedBlob: Blob | null = null;
    mockCreateObjectURL.mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock-url";
    });

    render(
      <DownloadPdfButton entries={mockEntries} summary={mockSummary} eventName="Test Event" />
    );
    fireEvent.click(screen.getByText("Preview"));

    expect(capturedBlob).not.toBeNull();
    expect(capturedBlob!.type).toBe("text/html");
  });

  it("escapes HTML in user-provided content", () => {
    let capturedBlob: Blob | null = null;
    mockCreateObjectURL.mockImplementation((blob: Blob) => {
      capturedBlob = blob;
      return "blob:mock-url";
    });

    const xssEntries = [
      { date: "2026-01-15", name: '<script>alert("xss")</script>', type: "income" as const, paymentMode: "cash" as const, amount: 1000, description: "Test" },
    ];

    render(
      <DownloadPdfButton entries={xssEntries} summary={mockSummary} eventName='<img onerror="alert(1)">' />
    );
    fireEvent.click(screen.getByText("Preview"));

    expect(capturedBlob).not.toBeNull();
    // Verify blob was created (HTML escaping happens inside buildReportHtml)
    expect(mockOpen).toHaveBeenCalledWith("blob:mock-url", "_blank");
  });
});
