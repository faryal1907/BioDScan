import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DataTable } from 'mantine-datatable';
import { MagnifyingGlass } from 'react-loader-spinner';
import mqttService, { BeeData } from '@/lib/mqtt';
import { IRootState } from '@/store';

const ComponentsDatatablesOrderSorting = () => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState<BeeData[]>([]);
    const [recordsData, setRecordsData] = useState<BeeData[]>([]);
    const [search, setSearch] = useState('');
    const [filterField, setFilterField] = useState('id'); // Default to 'id'
    const [sortStatus, setSortStatus] = useState<{ columnAccessor: string; direction: 'asc' | 'desc' }>({ columnAccessor: 'timestamp', direction: 'desc' });
    const [loading, setLoading] = useState(true);
    const [mqttConnected, setMqttConnected] = useState(false);

    // Handle real-time MQTT data
    const handleMQTTData = (data: BeeData) => {
        console.log('Received real-time MQTT data:', data);
        
        // Add the new data to the beginning of the records
        const newRecord = {
            id: data.id || `mqtt-${Date.now()}`,
            hive_id: data.hive_id || 'MQTT-HIVE',
            temperature: data.temperature,
            humidity: data.humidity,
            bumble_bee_count: data.bumble_bee_count,
            honey_bee_count: data.honey_bee_count,
            lady_bug_count: data.lady_bug_count,
            location: data.location || 'MQTT Location',
            notes: data.notes || 'Real-time data from MQTT',
            timestamp: data.timestamp || new Date().toISOString(),
        };
        
        setInitialRecords(prev => [newRecord, ...prev]);
    };

    // Set up MQTT connection and handlers
    useEffect(() => {
        const setupMQTT = async () => {
            try {
                await mqttService.connect();
                setMqttConnected(true);
                
                // Subscribe to bee data topics
                mqttService.subscribe('bio-d-scan/bee-data/#');
                
                // Set up message handler
                mqttService.onMessage((message) => {
                    try {
                        const data = JSON.parse(message.payload);
                        if (data.temperature !== undefined && data.humidity !== undefined) {
                            handleMQTTData(data as BeeData);
                        }
                    } catch (error: any) {
                        console.log('Message is not bee data format');
                    }
                });
                
                // Set up connection status handler
                mqttService.onConnectionChange((connected) => {
                    setMqttConnected(connected);
                });
                
            } catch (error: any) {
                console.error('Failed to connect to MQTT:', error);
                setMqttConnected(false);
            }
        };
        
        setupMQTT();
        
        // Cleanup on unmount
        return () => {
            mqttService.disconnect();
        };
    }, []);

    // Fetch data from /api/external-bee-data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/external-bee-data`);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const result = await response.json();
                console.log('API response:', result);
                setInitialRecords(Array.isArray(result.data) ? result.data : []);
            } catch (error: any) {
                console.error('Error loading data:', error.message);
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
        const recordsArray = Array.isArray(initialRecords) ? initialRecords : [];
        setRecordsData([...recordsArray.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    // Search functionality
    useEffect(() => {
        const recordsArray = Array.isArray(initialRecords) ? initialRecords : [];
        const filteredData = recordsArray.filter((item) => {
            if (!search) return true; // Show all records if no search term
            const searchLower = search.toLowerCase();

            switch (filterField) {
                case 'id':
                    return item.id && String(item.id).toLowerCase().includes(searchLower);
                case 'hive_id':
                    return item.hive_id && String(item.hive_id).toLowerCase().includes(searchLower);
                case 'temperature':
                    return item.temperature !== undefined && String(item.temperature).includes(searchLower);
                case 'humidity':
                    return item.humidity !== undefined && String(item.humidity).includes(searchLower);
                case 'bumble_bee_count':
                    return item.bumble_bee_count !== undefined && String(item.bumble_bee_count).includes(searchLower);
                case 'honey_bee_count':
                    return item.honey_bee_count !== undefined && String(item.honey_bee_count).includes(searchLower);
                case 'lady_bug_count':
                    return item.lady_bug_count !== undefined && String(item.lady_bug_count).includes(searchLower);
                case 'location':
                    return item.location && String(item.location).toLowerCase().includes(searchLower);
                case 'notes':
                    return item.notes && String(item.notes).toLowerCase().includes(searchLower);
                case 'timestamp':
                    return item.timestamp && new Date(item.timestamp).toLocaleString().toLowerCase().includes(searchLower);
                default:
                    return true; // Fallback to show all records
            }
        });
        setRecordsData([...filteredData.slice(0, pageSize)]);
        setPage(1);
    }, [search, pageSize, initialRecords, filterField]);

    return (
        <div className="panel mt-6">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <MagnifyingGlass
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="magnifying-glass-loading"
                        wrapperStyle={{}}
                        wrapperClass="magnifying-glass-wrapper"
                        glassColor="#c0efff"
                        color="#e15b64"
                    />
                </div>
            ) : (
                <>
                    <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                        <h5 className="text-lg font-semibold dark:text-white-light">Bee Data Records</h5>
                        <div className="ltr:ml-auto rtl:mr-auto flex gap-2 items-center">
                            {/* MQTT Status Indicator */}
                            <div className="flex items-center gap-2 mr-4">
                                <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    MQTT {mqttConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                            
                            <select
                                value={filterField}
                                onChange={(e) => setFilterField(e.target.value)}
                                className="form-select w-auto"
                            >
                                <option value="id">ID</option>
                                <option value="hive_id">Hive ID</option>
                                <option value="temperature">Temperature (°C)</option>
                                <option value="humidity">Humidity (%)</option>
                                <option value="bumble_bee_count">Bumble Bee Count</option>
                                <option value="honey_bee_count">Honey Bee Count</option>
                                <option value="lady_bug_count">Ladybug Count</option>
                                <option value="location">Location</option>
                                <option value="notes">Notes</option>
                                <option value="timestamp">Timestamp</option>
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
                            className={`${isRtl ? 'table-hover whitespace-nowrap' : 'table-hover whitespace-nowrap'}`}
                            records={recordsData}
                            columns={[
                                { accessor: 'id', title: 'ID', sortable: true, render: (record) => record.id || 'N/A' },
                                { accessor: 'hive_id', title: 'Hive ID', sortable: true, render: (record) => record.hive_id || 'N/A' },
                                {
                                    accessor: 'temperature',
                                    title: 'Temperature (°C)',
                                    sortable: true,
                                    render: (record) => record.temperature !== undefined ? record.temperature : 'N/A',
                                },
                                {
                                    accessor: 'humidity',
                                    title: 'Humidity (%)',
                                    sortable: true,
                                    render: (record) => record.humidity !== undefined ? record.humidity : 'N/A',
                                },
                                {
                                    accessor: 'bumble_bee_count',
                                    title: 'Bumble Bee Count',
                                    sortable: true,
                                    render: (record) => record.bumble_bee_count !== undefined ? record.bumble_bee_count : 'N/A',
                                },
                                {
                                    accessor: 'honey_bee_count',
                                    title: 'Honey Bee Count',
                                    sortable: true,
                                    render: (record) => record.honey_bee_count !== undefined ? record.honey_bee_count : 'N/A',
                                },
                                {
                                    accessor: 'lady_bug_count',
                                    title: 'Ladybug Count',
                                    sortable: true,
                                    render: (record) => record.lady_bug_count !== undefined ? record.lady_bug_count : 'N/A',
                                },
                                { accessor: 'location', title: 'Location', sortable: true, render: (record) => record.location || 'N/A' },
                                {
                                    accessor: 'timestamp',
                                    title: 'Timestamp',
                                    sortable: true,
                                    render: (record) => {
                                        if (!record.timestamp) return 'N/A';
                                        const date = new Date(record.timestamp);
                                        return date.toLocaleString();
                                    },
                                },
                                { accessor: 'notes', title: 'Notes', sortable: true, render: (record) => record.notes || 'N/A' },
                            ]}
                            totalRecords={initialRecords.length}
                            recordsPerPage={pageSize}
                            page={page}
                            onPageChange={(p) => setPage(p)}
                            recordsPerPageOptions={PAGE_SIZES}
                            onRecordsPerPageChange={setPageSize}
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            minHeight={200}
                            paginationText={({ from, to, totalRecords }) => `Showing ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ComponentsDatatablesOrderSorting;