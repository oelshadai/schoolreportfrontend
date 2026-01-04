import { supabase } from './supabase'

export const dbService = {
  // Schools
  async getSchools() {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
    return { data, error }
  },

  async createSchool(schoolData) {
    const { data, error } = await supabase
      .from('schools')
      .insert([schoolData])
      .select()
    return { data, error }
  },

  // Students
  async getStudents(schoolId) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
    return { data, error }
  },

  async createStudent(studentData) {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
    return { data, error }
  },

  // Teachers
  async getTeachers(schoolId) {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
    return { data, error }
  },

  async createTeacher(teacherData) {
    const { data, error } = await supabase
      .from('teachers')
      .insert([teacherData])
      .select()
    return { data, error }
  },

  // Reports
  async getReports(schoolId) {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('school_id', schoolId)
    return { data, error }
  },

  async createReport(reportData) {
    const { data, error } = await supabase
      .from('reports')
      .insert([reportData])
      .select()
    return { data, error }
  },

  // Scores
  async getScores(studentId) {
    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('student_id', studentId)
    return { data, error }
  },

  async createScore(scoreData) {
    const { data, error } = await supabase
      .from('scores')
      .insert([scoreData])
      .select()
    return { data, error }
  }
}