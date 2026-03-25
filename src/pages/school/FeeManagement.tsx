import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatCard from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, TrendingUp, AlertCircle, Search, Receipt, Users, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { feeService, type StudentSearchResult, type FeeType, type StudentFee, type FeePayment } from '@/services/feeService';
import secureApiClient from '@/lib/secureApiClient';

interface Class {
  id: number;
  level: string;
  section: string;
  full_name: string;
}

const FeeManagement = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('collect');
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedFeeType, setSelectedFeeType] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'MOBILE_MONEY'>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState({
    totalExpected: 0,
    totalCollected: 0,
    outstanding: 0,
    collectionRate: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = useCallback(async (showRefreshToast = false) => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchFeeTypes(),
        fetchClasses(),
        fetchStudentFees(),
        fetchPayments(),
        fetchSummary()
      ]);
      if (showRefreshToast) {
        toast.success('Data refreshed successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load fee data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeeTypes = async () => {
    try {
      const data = await feeService.getFeeTypes();
      setFeeTypes(data);
    } catch (error) {
      console.error('Failed to fetch fee types:', error);
      throw error;
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await secureApiClient.get('/schools/classes/');
      console.log('Classes response:', response); // Debug log
      const classList = Array.isArray(response) ? response : response.results || response.data || [];
      console.log('Processed classes:', classList); // Debug log
      setClasses(classList);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      setClasses([]); // Set empty array on error
      // Don't throw error to prevent blocking other data fetches
    }
  };

  const fetchStudentFees = async () => {
    try {
      const data = await feeService.getStudentFees({ ordering: '-updated_at' });
      setStudentFees(data.results);
    } catch (error) {
      console.error('Failed to fetch student fees:', error);
      throw error;
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await feeService.getFeePayments({ ordering: '-payment_date' });
      setPayments(data.results);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await feeService.getCollectionSummary();
      setSummary({
        totalExpected: data.total_outstanding + data.total_collected,
        totalCollected: data.total_collected,
        outstanding: data.total_outstanding,
        collectionRate: data.total_collected > 0 ? (data.total_collected / (data.total_outstanding + data.total_collected)) * 100 : 0
      });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      throw error;
    }
  };

  const searchStudents = useCallback(async () => {
    if (!searchQuery && selectedClass === 'all') {
      setStudents([]);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      const params: { q?: string; class_id?: number } = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedClass && selectedClass !== 'all') params.class_id = parseInt(selectedClass);

      const data = await feeService.searchStudents(params);
      setStudents(data || []);
      
      if (!data || data.length === 0) {
        toast.info('No students found matching your search criteria');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search students';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery, selectedClass]);

  // Auto-search when class is selected
  useEffect(() => {
    if (selectedClass !== 'all') {
      searchStudents();
    } else if (!searchQuery) {
      setStudents([]);
    }
  }, [selectedClass, searchStudents]);

  const validatePaymentForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedStudent) {
      errors.student = 'Please select a student';
    }
    
    if (!selectedFeeType) {
      errors.feeType = 'Please select a fee type';
    }
    
    if (!paymentAmount) {
      errors.amount = 'Please enter an amount';
    } else {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = 'Please enter a valid amount greater than 0';
      } else if (amount > 999999.99) {
        errors.amount = 'Amount cannot exceed GH₵ 999,999.99';
      }
    }
    
    if (paymentMethod === 'CHEQUE' && !referenceNumber) {
      errors.reference = 'Reference number is required for cheque payments';
    }
    
    if (paymentMethod === 'BANK_TRANSFER' && !referenceNumber) {
      errors.reference = 'Reference number is required for bank transfers';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const collectFee = async () => {
    if (!validatePaymentForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    const amount = parseFloat(paymentAmount);

    try {
      setPaymentLoading(true);
      setValidationErrors({});
      
      await feeService.createFeePayment({
        student: selectedStudent!.id,
        fee_type: parseInt(selectedFeeType),
        amount_paid: amount,
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined,
        notes: notes || undefined
      });

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Fee payment of GH₵ {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} recorded successfully</span>
        </div>
      );
      
      resetPaymentForm();
      
      // Refresh data in background
      setDataRefreshing(true);
      await Promise.all([
        fetchStudentFees(),
        fetchPayments(),
        fetchSummary()
      ]);
      setDataRefreshing(false);
      
      // Refresh student search to update balances
      if (searchQuery || selectedClass) {
        await searchStudents();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record payment';
      toast.error(
        <div className="flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const resetPaymentForm = () => {
    setSelectedStudent(null);
    // Don't reset selectedFeeType here as it's used for filtering
    setPaymentAmount('');
    setPaymentMethod('CASH');
    setReferenceNumber('');
    setNotes('');
    setValidationErrors({});
  };

  const handleRefresh = async () => {
    await fetchInitialData(true);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount).replace('GHS', 'GH₵');
  };

  const statusColors: Record<string, string> = {
    PAID: 'bg-green-100 text-green-800 border-green-200',
    PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    NOT_STARTED: 'bg-red-100 text-red-800 border-red-200',
    DEFAULTED: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const feeColumns = [
    { 
      key: 'student_name', 
      label: 'Student', 
      render: (fee: StudentFee) => (
        <div>
          <div className="font-medium">{fee.student_name}</div>
          <div className="text-sm text-muted-foreground">{fee.student_id}</div>
        </div>
      )
    },
    { 
      key: 'class_level', 
      label: 'Class', 
      render: (fee: StudentFee) => <Badge variant="outline">{fee.class_level}</Badge>
    },
    { 
      key: 'total_amount', 
      label: 'Total Fee', 
      render: (fee: StudentFee) => <span>{formatCurrency(fee.total_amount)}</span>
    },
    { 
      key: 'amount_paid', 
      label: 'Paid', 
      render: (fee: StudentFee) => <span className="text-green-600">{formatCurrency(fee.amount_paid)}</span>
    },
    { 
      key: 'balance', 
      label: 'Balance', 
      render: (fee: StudentFee) => (
        <span className={fee.balance > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
          {formatCurrency(fee.balance)}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status', 
      render: (fee: StudentFee) => (
        <Badge variant="outline" className={statusColors[fee.status]}>
          {fee.status.replace('_', ' ')}
        </Badge>
      )
    }
  ];

  const paymentColumns = [
    { 
      key: 'student_name', 
      label: 'Student', 
      render: (payment: FeePayment) => (
        <div>
          <div className="font-medium">{payment.student_name}</div>
          <div className="text-sm text-muted-foreground">{payment.student_id}</div>
        </div>
      )
    },
    { 
      key: 'fee_type_name', 
      label: 'Fee Type', 
      render: (payment: FeePayment) => <Badge variant="secondary">{payment.fee_type_name}</Badge>
    },
    { 
      key: 'amount_paid', 
      label: 'Amount', 
      render: (payment: FeePayment) => <span className="font-medium">{formatCurrency(payment.amount_paid)}</span>
    },
    { 
      key: 'payment_method', 
      label: 'Method', 
      render: (payment: FeePayment) => <span>{payment.payment_method}</span>
    },
    { 
      key: 'payment_date', 
      label: 'Date', 
      render: (payment: FeePayment) => new Date(payment.payment_date).toLocaleDateString()
    },
    { 
      key: 'collected_by_name', 
      label: 'Collected By', 
      render: (payment: FeePayment) => <span className="text-sm">{payment.collected_by_name}</span>
    },
    { 
      key: 'is_verified', 
      label: 'Status', 
      render: (payment: FeePayment) => (
        <Badge variant={payment.is_verified ? 'default' : 'secondary'}>
          {payment.is_verified ? 'Verified' : 'Pending'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Fee Management" 
        description="Collect and manage student fees across all classes"
        action={
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading || dataRefreshing}>
            {(loading || dataRefreshing) ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {dataRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard 
              label="Total Expected" 
              value={formatCurrency(summary.totalExpected)} 
              icon={<DollarSign className="h-5 w-5" />} 
              color="text-blue-600" 
            />
            <StatCard 
              label="Total Collected" 
              value={formatCurrency(summary.totalCollected)} 
              icon={<TrendingUp className="h-5 w-5" />} 
              color="text-green-600" 
              trend={`${summary.collectionRate.toFixed(1)}% collection rate`}
            />
            <StatCard 
              label="Outstanding" 
              value={formatCurrency(summary.outstanding)} 
              icon={<AlertCircle className="h-5 w-5" />} 
              color="text-red-600" 
            />
            <StatCard 
              label="Total Payments" 
              value={(payments?.length || 0).toLocaleString()} 
              icon={<Receipt className="h-5 w-5" />} 
              color="text-purple-600" 
            />
          </>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collect">Collect Fees</TabsTrigger>
          <TabsTrigger value="records">Fee Records</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="collect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Search & Fee Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee-type-select">Fee Type</Label>
                  <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fee Types</SelectItem>
                      {(feeTypes || []).map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="class-select">Select Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {(classes || []).map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.full_name || `${cls.level} ${cls.section}`.trim()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="search-input">Search Student</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-input"
                      placeholder="Name, surname, or student ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={searchStudents} className="w-full" disabled={searchLoading}>
                    {searchLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    {searchLoading ? 'Searching...' : 'Search Students'}
                  </Button>
                </div>
              </div>

              {/* Student Results */}
              {students && students.length > 0 && (
                <div className="space-y-2">
                  <Label>Search Results ({students.length} students)</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-md">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                          selectedStudent?.id === student.id ? 'bg-primary/10 border-primary' : ''
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {student.first_name} {student.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.student_id} • {student.class_level} {student.section}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Balance: {formatCurrency(student.current_balance)}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={statusColors[student.payment_status] || statusColors.NOT_STARTED}
                            >
                              {student.payment_status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Form */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-medium mb-3">
                  {selectedStudent ? `Collect Fee from ${selectedStudent.first_name} ${selectedStudent.last_name}` : 'Fee Collection Form'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fee Type *</Label>
                    <Select 
                      value={selectedFeeType && selectedFeeType !== 'all' ? selectedFeeType : ''} 
                      onValueChange={(value) => {
                        setSelectedFeeType(value);
                        setValidationErrors(prev => ({ ...prev, feeType: '' }));
                      }}
                    >
                      <SelectTrigger className={validationErrors.feeType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select fee type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(feeTypes || []).map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.feeType && (
                      <p className="text-sm text-red-500">{validationErrors.feeType}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Amount (GH₵) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="999999.99"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => {
                        setPaymentAmount(e.target.value);
                        setValidationErrors(prev => ({ ...prev, amount: '' }));
                      }}
                      className={validationErrors.amount ? 'border-red-500' : ''}
                    />
                    {validationErrors.amount && (
                      <p className="text-sm text-red-500">{validationErrors.amount}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>
                      Reference Number
                      {(paymentMethod === 'CHEQUE' || paymentMethod === 'BANK_TRANSFER') && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <Input
                      placeholder={
                        paymentMethod === 'CHEQUE' ? 'Cheque number' :
                        paymentMethod === 'BANK_TRANSFER' ? 'Transaction reference' :
                        paymentMethod === 'MOBILE_MONEY' ? 'Transaction ID' :
                        'Receipt/Reference number'
                      }
                      value={referenceNumber}
                      onChange={(e) => {
                        setReferenceNumber(e.target.value);
                        setValidationErrors(prev => ({ ...prev, reference: '' }));
                      }}
                      className={validationErrors.reference ? 'border-red-500' : ''}
                    />
                    {validationErrors.reference && (
                      <p className="text-sm text-red-500">{validationErrors.reference}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={collectFee} 
                    className="flex-1" 
                    disabled={paymentLoading || !selectedStudent || !selectedFeeType || !paymentAmount}
                  >
                    {paymentLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Receipt className="h-4 w-4 mr-2" />
                    )}
                    {paymentLoading ? 'Recording...' : 'Record Payment'}
                  </Button>
                  {selectedStudent && (
                    <Button variant="outline" onClick={() => setSelectedStudent(null)} disabled={paymentLoading}>
                      Clear Student
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Student Fee Records</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable 
                  columns={feeColumns} 
                  data={studentFees || []} 
                  searchKey="student_name" 
                  searchPlaceholder="Search by student name..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable 
                  columns={paymentColumns} 
                  data={payments || []} 
                  searchKey="student_name" 
                  searchPlaceholder="Search payments..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagement;