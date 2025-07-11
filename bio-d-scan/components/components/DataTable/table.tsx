import React, { useEffect, useState } from 'react';
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

const BeeDataTable = () => {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<BeeRecord[]>([]);
    const [recordsData, setRecordsData] = useState<BeeRecord[]>([]);
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

    // Fetch data from /api/external-bee-data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/external-bee-data');
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const result = await response.json();
                setInitialRecords(Array.isArray(result.data) ? result.data : []);
            } catch (error) {
                console.error('Failed to load data:', error);
                setInitialRecords([]);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Pagination
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    // Search functionality
    useEffect(() => {
        const filteredData = initialRecords.filter((item) => {
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
        setRecordsData([...filteredData.slice(0, pageSize)]);
        setPage(1);
    }, [search, pageSize, initialRecords, filterField]);

    return (
        <div className="panel mt-6">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                    <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                        <h5 className="text-lg font-semibold dark:text-white-light">Bee Data Table</h5>
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
                        </div>
                    </div>
                    <div className="datatables">
                        <DataTable
                            highlightOnHover
                            className="table-hover whitespace-nowrap"
                            records={recordsData}
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
                            totalRecords={initialRecords.length}
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
        </div>
    );
};

export default BeeDataTable;
