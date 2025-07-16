import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DataTable } from 'mantine-datatable';

// Define the structure of your data
type BeeRecord = {
    id: string;
    Date: string;
    Time: string;
    'Bumble Bee': number;
    'Honey Bee': number;
    'Lady Bug': number;
    'Total Count': number;
    'Temperature (C)': number;
    'Humidity (%)': number;
    Location: string;
};

const PAGE_SIZES = [10, 20, 30, 50, 100];
const POLL_INTERVAL = 5000; // 5 seconds

const BeeDataTable = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [recordsData, setRecordsData] = useState<BeeRecord[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [search, setSearch] = useState('');
    const [filterField, setFilterField] = useState('id');
    const [sortStatus, setSortStatus] = useState<{
        columnAccessor: string;
        direction: 'asc' | 'desc';
    }>({
        columnAccessor: 'Date',
        direction: 'desc',
    });
    const [loading, setLoading] = useState(true);
    const isFirstLoad = useRef(true);
    const [pageInput, setPageInput] = useState('1');

    // Fetch paginated data from /api/external-bee-data
    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const response = await fetch(`/api/external-bee-data?page=${page}&pageSize=${pageSize}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            setRecordsData(Array.isArray(result.data) ? result.data : []);
            // Only update totalRecords if result.total is a valid number
            if (typeof result.total === 'number' && !isNaN(result.total)) {
                setTotalRecords(result.total);
            }
            // If the current page is out of range, clamp to last page
            const maxPage = Math.max(1, Math.ceil((result.total || 0) / pageSize));
            if (page > maxPage) {
                setPage(maxPage);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            setRecordsData([]);
            // Do not reset totalRecords to 0 on error
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [page, pageSize]);

    useEffect(() => {
        fetchData(true).then(() => { isFirstLoad.current = false; });
        const interval = setInterval(() => fetchData(false), POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);

    useEffect(() => {
        setPageInput(page.toString()); // Keep input in sync with current page
    }, [page]);

    // Search functionality (client-side, on current page)
    const filteredRecords = recordsData.filter((item) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        switch (filterField) {
            case 'id':
                return item.id && item.id.toLowerCase().includes(searchLower);
            case 'Date':
                return item.Date && item.Date.toLowerCase().includes(searchLower);
            case 'Time':
                return item.Time && item.Time.toLowerCase().includes(searchLower);
            case 'Bumble Bee':
                return String(item['Bumble Bee']).includes(searchLower);
            case 'Honey Bee':
                return String(item['Honey Bee']).includes(searchLower);
            case 'Lady Bug':
                return String(item['Lady Bug']).includes(searchLower);
            case 'Total Count':
                return String(item['Total Count']).includes(searchLower);
            case 'Temperature (C)':
                return String(item['Temperature (C)']).includes(searchLower);
            case 'Humidity (%)':
                return String(item['Humidity (%)']).includes(searchLower);
            case 'Location':
                return item.Location.toLowerCase().includes(searchLower);
            default:
                return true;
        }
    });

    return (
        <>
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                    <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                        <div className="ltr:ml-auto rtl:mr-auto flex gap-2 items-center">
                            <select
                                value={filterField}
                                onChange={(e) => setFilterField(e.target.value)}
                                className="form-select w-auto"
                            >
                                <option value="id">ID</option>
                                <option value="Date">Date</option>
                                <option value="Time">Time</option>
                                <option value="Bumble Bee">Bumble Bee</option>
                                <option value="Honey Bee">Honey Bee</option>
                                <option value="Lady Bug">Lady Bug</option>
                                <option value="Total Count">Total Count</option>
                                <option value="Temperature (C)">Temperature (C)</option>
                                <option value="Humidity (%)">Humidity (%)</option>
                                <option value="Location">Location</option>
                            </select>
                            <input
                                type="text"
                                className="form-input w-auto"
                                placeholder={`Search ${filterField}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {/* Page number input */}
                            <form
                                onSubmit={e => {
                                    e.preventDefault();
                                    const num = parseInt(pageInput, 10);
                                    const maxPage = Math.max(1, Math.ceil(totalRecords / pageSize));
                                    if (!isNaN(num) && num >= 1 && num <= maxPage) {
                                        setPage(num);
                                    } else {
                                        setPageInput(page.toString()); // Reset to current page if invalid
                                    }
                                }}
                                className="flex items-center gap-1"
                                style={{ marginLeft: 8 }}
                            >
                                <input
                                    type="number"
                                    min={1}
                                    max={Math.max(1, Math.ceil(totalRecords / pageSize))}
                                    value={pageInput}
                                    onChange={e => setPageInput(e.target.value)}
                                    className="form-input w-20 text-center"
                                    style={{ width: 80, paddingLeft: 4, paddingRight: 4 }}
                                    title="Go to page"
                                />
                                <span>/ {Math.max(1, Math.ceil(totalRecords / pageSize))}</span>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '0 8px' }}
                                    title="Go to page"
                                >Go</button>
                            </form>
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            highlightOnHover
                            className="table-hover whitespace-nowrap"
                            records={filteredRecords}
                            columns={[
                                { accessor: 'id', title: 'ID', sortable: true },
                                { accessor: 'Date', title: 'Date', sortable: true },
                                { accessor: 'Time', title: 'Time', sortable: true },
                                { accessor: 'Bumble Bee', title: 'Bumble Bee', sortable: true },
                                { accessor: 'Honey Bee', title: 'Honey Bee', sortable: true },
                                { accessor: 'Lady Bug', title: 'Lady Bug', sortable: true },
                                { accessor: 'Total Count', title: 'Total Count', sortable: true },
                                { accessor: 'Temperature (C)', title: 'Temperature (C)', sortable: true },
                                { accessor: 'Humidity (%)', title: 'Humidity (%)', sortable: true },
                                { accessor: 'Location', title: 'Location', sortable: true },
                            ]}
                            totalRecords={totalRecords}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={setPage}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) =>
                                `Showing ${from} to ${to} of ${totalRecords} entries`
                            }
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default BeeDataTable;
