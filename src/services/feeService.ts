import secureApiClient from '../lib/secureApiClient';

export interface FeeType {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface FeeStructure {
  id: number;
  fee_type: number;
  fee_type_name: string;
  level: string;
  amount: number;
  collection_period: string;
  due_date?: string;
}

export interface StudentFee {
  id: number;
  student_id: string;
  student_name: string;
  class_level: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  status: 'NOT_STARTED' | 'PARTIAL' | 'PAID' | 'DEFAULTED';
  last_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FeePayment {
  id: number;
  student_id: string;
  student_name: string;
  fee_type: number;
  fee_type_name: string;
  amount_paid: number;
  payment_method: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  reference_number?: string;
  notes?: string;
  payment_date: string;
  collected_by_name: string;
  is_verified: boolean;
  created_at: string;
}

export interface StudentSearchResult {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  class_level: string;
  section: string;
  email: string;
  phone_number: string;
  current_balance: number;
  payment_status: string;
}

export interface FeeCollectionSummary {
  total_outstanding: number;
  total_collected: number;
  by_fee_type: Array<{
    fee_type__name: string;
    total: number;
    transactions: number;
  }>;
  by_collector: Array<{
    collected_by__first_name: string;
    collected_by__last_name: string;
    total: number;
    transactions: number;
  }>;
}

export interface CreateFeePayment {
  student: number;
  fee_type: number;
  amount_paid: number;
  payment_method: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER' | 'MOBILE_MONEY';
  reference_number?: string;
  notes?: string;
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

class FeeService {
  private handleError(error: any): never {
    console.error('Fee service error:', error);
    
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    // Handle validation errors
    if (error.response?.status === 400 && error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'object' && !data.detail && !data.message) {
        // Field validation errors
        const fieldErrors = Object.entries(data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        throw new Error(`Validation error: ${fieldErrors}`);
      }
    }
    
    // Handle specific error messages
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    // Handle HTTP status codes
    switch (error.response?.status) {
      case 401:
        throw new Error('Authentication required. Please log in again.');
      case 403:
        throw new Error('You do not have permission to perform this action.');
      case 404:
        throw new Error('The requested resource was not found.');
      case 429:
        throw new Error('Too many requests. Please wait a moment and try again.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  private async makeRequest<T>(requestFn: () => Promise<any>): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Fee Types
  async getFeeTypes(): Promise<FeeType[]> {
    return this.makeRequest(async () => {
      const response = await secureApiClient.get('/fees/types/');
      return { data: response.data?.results || response.data || [] };
    });
  }

  async createFeeType(data: Omit<FeeType, 'id'>): Promise<FeeType> {
    return this.makeRequest(() => secureApiClient.post('/fees/types/', data));
  }

  async updateFeeType(id: number, data: Partial<FeeType>): Promise<FeeType> {
    return this.makeRequest(() => secureApiClient.patch(`/fees/types/${id}/`, data));
  }

  async deleteFeeType(id: number): Promise<void> {
    return this.makeRequest(() => secureApiClient.delete(`/fees/types/${id}/`));
  }

  // Fee Structures
  async getFeeStructures(params?: { fee_type?: number; level?: string }): Promise<FeeStructure[]> {
    return this.makeRequest(async () => {
      const response = await secureApiClient.get('/fees/structures/', { params });
      return { data: response.data?.results || response.data || [] };
    });
  }

  async createFeeStructure(data: Omit<FeeStructure, 'id' | 'fee_type_name'>): Promise<FeeStructure> {
    return this.makeRequest(() => secureApiClient.post('/fees/structures/', data));
  }

  async updateFeeStructure(id: number, data: Partial<FeeStructure>): Promise<FeeStructure> {
    return this.makeRequest(() => secureApiClient.patch(`/fees/structures/${id}/`, data));
  }

  async deleteFeeStructure(id: number): Promise<void> {
    return this.makeRequest(() => secureApiClient.delete(`/fees/structures/${id}/`));
  }

  // Student Fees
  async getStudentFees(params?: { 
    status?: string; 
    class_id?: number; 
    search?: string;
    ordering?: string;
  }): Promise<ApiResponse<StudentFee>> {
    return this.makeRequest(async () => {
      const response = await secureApiClient.get('/fees/student-fees/', { params });
      return { data: { results: response.data?.results || [], count: response.data?.count || 0 } };
    });
  }

  async getStudentFeesByStatus(): Promise<Array<{ status: string; count: number; total_balance: number }>> {
    return this.makeRequest(() => secureApiClient.get('/fees/student-fees/by_fee_status/'));
  }

  async getStudentFeeById(id: number): Promise<StudentFee> {
    return this.makeRequest(() => secureApiClient.get(`/fees/student-fees/${id}/`));
  }

  // Fee Payments
  async getFeePayments(params?: {
    student?: number;
    fee_type?: number;
    payment_date?: string;
    ordering?: string;
  }): Promise<ApiResponse<FeePayment>> {
    return this.makeRequest(async () => {
      const response = await secureApiClient.get('/fees/payments/', { params });
      return { data: { results: response.data?.results || [], count: response.data?.count || 0 } };
    });
  }

  async createFeePayment(data: CreateFeePayment): Promise<FeePayment> {
    // Validate payment data before sending
    this.validatePaymentData(data);
    return this.makeRequest(() => secureApiClient.post('/fees/payments/collect_fee/', data));
  }

  async getFeePaymentById(id: number): Promise<FeePayment> {
    return this.makeRequest(() => secureApiClient.get(`/fees/payments/${id}/`));
  }

  async verifyPayment(id: number): Promise<FeePayment> {
    return this.makeRequest(() => secureApiClient.patch(`/fees/payments/${id}/`, { is_verified: true }));
  }

  async getPaymentsByFeeType(): Promise<Array<{
    fee_type: number;
    fee_type__name: string;
    total_paid: number;
    transactions: number;
  }>> {
    return this.makeRequest(() => secureApiClient.get('/fees/payments/by_fee_type/'));
  }

  async getPaymentsByClass(classId: number): Promise<Array<{
    fee_type: number;
    fee_type__name: string;
    total_paid: number;
    students_paid: number;
  }>> {
    return this.makeRequest(() => secureApiClient.get(`/fees/payments/by_class/?class_id=${classId}`));
  }

  // Student Search
  async searchStudents(params: {
    q?: string;
    class_id?: number;
  }): Promise<StudentSearchResult[]> {
    if (!params.q && !params.class_id) {
      throw new Error('Please provide either a search query or select a class');
    }
    return this.makeRequest(async () => {
      const response = await secureApiClient.get('/fees/search/search/', { params });
      return { data: response || [] };
    });
  }

  // Reports
  async getCollectionSummary(): Promise<FeeCollectionSummary> {
    return this.makeRequest(async () => {
      const response = await secureApiClient.get('/fees/reports/collection_summary/');
      const data = response.data || {};
      return { 
        data: {
          total_outstanding: data.total_outstanding || 0,
          total_collected: data.total_collected || 0,
          by_fee_type: data.by_fee_type || [],
          by_collector: data.by_collector || []
        }
      };
    });
  }

  async getClassSummary(classId: number): Promise<{
    class: {
      id: number;
      level: string;
      section: string;
      total_students: number;
    };
    fee_summary: Array<{
      fee_type__name: string;
      total_collected: number;
      students_paid: number;
      transactions: number;
    }>;
    payment_status: Array<{
      status: string;
      count: number;
    }>;
  }> {
    return this.makeRequest(() => secureApiClient.get(`/fees/reports/class_summary/?class_id=${classId}`));
  }

  // Fee Collections (for tracking collection sessions)
  async getFeeCollections(params?: {
    collected_by?: number;
    fee_type?: number;
    ordering?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest(() => secureApiClient.get('/fees/collections/', { params }));
  }

  async createFeeCollection(data: any): Promise<any> {
    return this.makeRequest(() => secureApiClient.post('/fees/collections/', data));
  }

  // Utility methods
  private validatePaymentData(data: CreateFeePayment): void {
    if (!data.student || data.student <= 0) {
      throw new Error('Valid student ID is required');
    }
    if (!data.fee_type || data.fee_type <= 0) {
      throw new Error('Valid fee type is required');
    }
    if (!data.amount_paid || data.amount_paid <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    if (data.amount_paid > 999999.99) {
      throw new Error('Payment amount cannot exceed GH₵ 999,999.99');
    }
    if (!['CASH', 'CHEQUE', 'BANK_TRANSFER', 'MOBILE_MONEY'].includes(data.payment_method)) {
      throw new Error('Invalid payment method');
    }
    if ((data.payment_method === 'CHEQUE' || data.payment_method === 'BANK_TRANSFER') && !data.reference_number) {
      throw new Error(`Reference number is required for ${data.payment_method.toLowerCase().replace('_', ' ')} payments`);
    }
  }

  // Bulk operations
  async bulkCreateFeePayments(payments: CreateFeePayment[]): Promise<FeePayment[]> {
    if (!payments || payments.length === 0) {
      throw new Error('No payments provided');
    }
    
    // Validate all payments first
    payments.forEach((payment, index) => {
      try {
        this.validatePaymentData(payment);
      } catch (error) {
        throw new Error(`Payment ${index + 1}: ${error.message}`);
      }
    });
    
    return this.makeRequest(() => secureApiClient.post('/fees/payments/bulk_create/', { payments }));
  }

  // Fee validation
  async validateFeePayment(data: CreateFeePayment): Promise<{ valid: boolean; errors?: string[] }> {
    try {
      this.validatePaymentData(data);
      return this.makeRequest(() => secureApiClient.post('/fees/payments/validate/', data));
    } catch (error) {
      return {
        valid: false,
        errors: [error.message]
      };
    }
  }

  // Currency formatting utility
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2
    }).format(amount).replace('GHS', 'GH₵');
  }

  // Date formatting utility
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Payment status utility
  getPaymentStatusColor(status: string): string {
    const colors = {
      PAID: 'bg-green-100 text-green-800 border-green-200',
      PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      NOT_STARTED: 'bg-red-100 text-red-800 border-red-200',
      DEFAULTED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.NOT_STARTED;
  }
}

export const feeService = new FeeService();

// Export utility functions for use in components
export const feeUtils = {
  formatCurrency: feeService.formatCurrency.bind(feeService),
  formatDate: feeService.formatDate.bind(feeService),
  getPaymentStatusColor: feeService.getPaymentStatusColor.bind(feeService)
};