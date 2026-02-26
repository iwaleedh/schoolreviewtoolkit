/**
 * School Profile Page
 * 
 * Comprehensive school information form with 16 sections in tab format
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
    Building,
    Users,
    GraduationCap,
    MapPin,
    Phone,
    Mail,
    Globe,
    Calendar,
    Briefcase,
    BookOpen,
    Heart,
    Shield,
    Wifi,
    WifiOff,
    Monitor,
    ChevronDown,
    ChevronUp,
    CheckCircle,
    DollarSign,
    Award,
    Home,
    Laptop,
    FileText,
    Box,
    Trophy
} from 'lucide-react';
import { useSSEData } from '../context/SSEDataContext';
import './SchoolProfile.css';

// Tab configuration - organized into rows
const primaryTabs = [
    { id: 'basic', label: null, labelDv: 'ސްކޫލުގެ މަޢުލޫމާތު', icon: Building },
    { id: 'management', label: null, labelDv: 'އިސްވެރިންގެ މަޢުލޫމާތު', icon: Users },
    { id: 'contact', label: null, labelDv: 'ގުޅޭނެ ގޮތް', icon: Phone },
    { id: 'administration', label: null, labelDv: 'އިދާރީ އަދި ޓެކްނިކަލް', icon: Briefcase },
    { id: 'teachers', label: null, labelDv: 'މުދައްރިސުން', icon: GraduationCap },
    { id: 'students', label: null, labelDv: 'ދަރިވަރުން', icon: BookOpen },

    { id: 'literacy', label: null, labelDv: 'ލިޓްރަސީ', icon: BookOpen },
    { id: 'resources', label: null, labelDv: 'ވަސީލަތްތައް', icon: Box },
    { id: 'olevel_results', label: null, labelDv: 'އޯލެވެލް ނަތީޖާ', icon: GraduationCap },
    { id: 'alevel_results', label: null, labelDv: 'އޭލެވެލް ނަތީޖާ', icon: GraduationCap },
    { id: 'school_exam_results', label: null, labelDv: 'ސްކޫލް އިމްތިޙާނު ނަތީޖާ', icon: FileText },
    { id: 'extracurricular', label: null, labelDv: 'އިތުރު ހަރަކާތްތައް', icon: Trophy },
];

const secondaryTabs = [];

// All sections combined for reference
const allSections = [...primaryTabs, ...secondaryTabs];

// Initial form data
const initialFormData = {
    // Basic Information
    sp_atollIsland: '',
    sp_schoolName: '',
    sp_phone: '',
    sp_openedDate: '',
    sp_stages: '',
    sp_email: '',
    sp_studentTeacherRatio: '',
    sp_teacherCount: '',
    sp_studentCount: '',
    sp_hasSchoolBoard: false,
    sp_hasPTA: false,
    sp_sessionCount: '',
    sp_hasMorningSession: false,
    sp_morningSessionTime: '',
    sp_hasAfternoonSession: false,
    sp_afternoonSessionTime: '',

    // Management Information
    sp_mgmt_hasAdminReq: false,
    sp_mgmt_hasDeputyPrincipalReq: false,
    sp_mgmt_leadingTeacherReqCount: '',
    sp_mgmt_leadingTeacherCount: '',
    sp_mgmt_deputyPrincipalReqCount: '',
    sp_mgmt_staffList: [],

    // Contact Details
    phone: '',
    fax: '',
    email: '',
    website: '',
    principalPhone: '',
    emergencyContact: '',

    // Administration
    principalName: '',
    principalNameDv: '',
    deputyPrincipalName: '',
    adminOfficerName: '',
    totalAdminStaff: '',

    // Admin & Technical Staff Table
    sp_st_admin_actual: '', sp_st_admin_req: '',
    sp_st_support_actual: '', sp_st_support_req: '',
    sp_st_counselors_actual: '', sp_st_counselors_req: '',
    sp_st_health_actual: '', sp_st_health_req: '',
    sp_st_librarians_actual: '', sp_st_librarians_req: '',
    sp_st_lab_actual: '', sp_st_lab_req: '',
    sp_st_sports_actual: '', sp_st_sports_req: '',

    // Teaching Staff
    // Teaching Staff Information
    // Table 1: Requirements vs Actuals
    sp_t_total_actual: '', sp_t_total_req: '',
    sp_t_sen_actual: '', sp_t_sen_req: '',
    sp_t_foundation_actual: '', sp_t_foundation_req: '',
    sp_t_under8_actual: '', sp_t_under8_req: '',
    sp_t_above8_actual: '', sp_t_above8_req: '',
    sp_t_lvl9_actual: '', sp_t_lvl10_actual: '',
    sp_t_lvl7_actual: '', sp_t_lvl8_actual: '',
    sp_t_lvl5_actual: '', sp_t_lvl6_actual: '',

    // Table 2: Teacher Matrix 
    // Format: sp_tm_[row]_[col]
    // General (Left group in RTL)
    sp_tm_m_gen_local: '', sp_tm_m_gen_expat: '', sp_tm_m_gen_sen: '', sp_tm_m_gen_total: '',
    sp_tm_f_gen_local: '', sp_tm_f_gen_expat: '', sp_tm_f_gen_sen: '', sp_tm_f_gen_total: '',
    sp_tm_t_gen_local: '', sp_tm_t_gen_expat: '', sp_tm_t_gen_sen: '', sp_tm_t_gen_total: '',

    // Trained (Middle group)
    sp_tm_m_tr_local: '', sp_tm_m_tr_expat: '', sp_tm_m_tr_temp: '', sp_tm_m_tr_sen: '', sp_tm_m_tr_total: '',
    sp_tm_f_tr_local: '', sp_tm_f_tr_expat: '', sp_tm_f_tr_temp: '', sp_tm_f_tr_sen: '', sp_tm_f_tr_total: '',
    sp_tm_t_tr_local: '', sp_tm_t_tr_expat: '', sp_tm_t_tr_temp: '', sp_tm_t_tr_sen: '', sp_tm_t_tr_total: '',

    // Untrained (Right group in RTL)
    sp_tm_m_un_local: '', sp_tm_m_un_expat: '', sp_tm_m_un_sen: '', sp_tm_m_un_total: '',
    sp_tm_f_un_local: '', sp_tm_f_un_expat: '', sp_tm_f_un_sen: '', sp_tm_f_un_total: '',
    sp_tm_t_un_local: '', sp_tm_t_un_expat: '', sp_tm_t_un_sen: '', sp_tm_t_un_total: '',



    // Student Enrollment
    // Student Enrollment Matrix
    // Format: sp_s_[row]_[grade]
    // Rows: f (female), m (male), t (total)
    // Grades: lkg, ukg, 1-12
    sp_s_f_lkg: '', sp_s_f_ukg: '', sp_s_f_1: '', sp_s_f_2: '', sp_s_f_3: '', sp_s_f_4: '', sp_s_f_5: '', sp_s_f_6: '', sp_s_f_7: '', sp_s_f_8: '', sp_s_f_9: '', sp_s_f_10: '', sp_s_f_11: '', sp_s_f_12: '', sp_s_f_total: '',
    sp_s_m_lkg: '', sp_s_m_ukg: '', sp_s_m_1: '', sp_s_m_2: '', sp_s_m_3: '', sp_s_m_4: '', sp_s_m_5: '', sp_s_m_6: '', sp_s_m_7: '', sp_s_m_8: '', sp_s_m_9: '', sp_s_m_10: '', sp_s_m_11: '', sp_s_m_12: '', sp_s_m_total: '',
    sp_s_t_lkg: '', sp_s_t_ukg: '', sp_s_t_1: '', sp_s_t_2: '', sp_s_t_3: '', sp_s_t_4: '', sp_s_t_5: '', sp_s_t_6: '', sp_s_t_7: '', sp_s_t_8: '', sp_s_t_9: '', sp_s_t_10: '', sp_s_t_11: '', sp_s_t_12: '', sp_s_t_total: '',

    // SEN Students
    // Table 6: SEN Suspected (sp_sen_s_)
    sp_sen_s_f_lkg: '', sp_sen_s_f_ukg: '', sp_sen_s_f_1: '', sp_sen_s_f_2: '', sp_sen_s_f_3: '', sp_sen_s_f_4: '', sp_sen_s_f_5: '', sp_sen_s_f_6: '', sp_sen_s_f_7: '', sp_sen_s_f_8: '', sp_sen_s_f_9: '', sp_sen_s_f_10: '', sp_sen_s_f_11: '', sp_sen_s_f_12: '', sp_sen_s_f_total: '',
    sp_sen_s_m_lkg: '', sp_sen_s_m_ukg: '', sp_sen_s_m_1: '', sp_sen_s_m_2: '', sp_sen_s_m_3: '', sp_sen_s_m_4: '', sp_sen_s_m_5: '', sp_sen_s_m_6: '', sp_sen_s_m_7: '', sp_sen_s_m_8: '', sp_sen_s_m_9: '', sp_sen_s_m_10: '', sp_sen_s_m_11: '', sp_sen_s_m_12: '', sp_sen_s_m_total: '',
    sp_sen_s_t_lkg: '', sp_sen_s_t_ukg: '', sp_sen_s_t_1: '', sp_sen_s_t_2: '', sp_sen_s_t_3: '', sp_sen_s_t_4: '', sp_sen_s_t_5: '', sp_sen_s_t_6: '', sp_sen_s_t_7: '', sp_sen_s_t_8: '', sp_sen_s_t_9: '', sp_sen_s_t_10: '', sp_sen_s_t_11: '', sp_sen_s_t_12: '', sp_sen_s_t_total: '',

    // Table 7: SEN Diagnosed (sp_sen_d_)
    sp_sen_d_f_lkg: '', sp_sen_d_f_ukg: '', sp_sen_d_f_1: '', sp_sen_d_f_2: '', sp_sen_d_f_3: '', sp_sen_d_f_4: '', sp_sen_d_f_5: '', sp_sen_d_f_6: '', sp_sen_d_f_7: '', sp_sen_d_f_8: '', sp_sen_d_f_9: '', sp_sen_d_f_10: '', sp_sen_d_f_11: '', sp_sen_d_f_12: '', sp_sen_d_f_total: '',
    sp_sen_d_m_lkg: '', sp_sen_d_m_ukg: '', sp_sen_d_m_1: '', sp_sen_d_m_2: '', sp_sen_d_m_3: '', sp_sen_d_m_4: '', sp_sen_d_m_5: '', sp_sen_d_m_6: '', sp_sen_d_m_7: '', sp_sen_d_m_8: '', sp_sen_d_m_9: '', sp_sen_d_m_10: '', sp_sen_d_m_11: '', sp_sen_d_m_12: '', sp_sen_d_m_total: '',
    sp_sen_d_t_lkg: '', sp_sen_d_t_ukg: '', sp_sen_d_t_1: '', sp_sen_d_t_2: '', sp_sen_d_t_3: '', sp_sen_d_t_4: '', sp_sen_d_t_5: '', sp_sen_d_t_6: '', sp_sen_d_t_7: '', sp_sen_d_t_8: '', sp_sen_d_t_9: '', sp_sen_d_t_10: '', sp_sen_d_t_11: '', sp_sen_d_t_12: '', sp_sen_d_t_total: '',

    // Literacy & Numeracy
    // Table 8: Illiterate in Dhivehi (sp_lit_dn_) - No Foundation
    sp_lit_dn_f_1: '', sp_lit_dn_f_2: '', sp_lit_dn_f_3: '', sp_lit_dn_f_4: '', sp_lit_dn_f_5: '', sp_lit_dn_f_6: '', sp_lit_dn_f_7: '', sp_lit_dn_f_8: '', sp_lit_dn_f_9: '', sp_lit_dn_f_10: '', sp_lit_dn_f_11: '', sp_lit_dn_f_12: '', sp_lit_dn_f_total: '',
    sp_lit_dn_m_1: '', sp_lit_dn_m_2: '', sp_lit_dn_m_3: '', sp_lit_dn_m_4: '', sp_lit_dn_m_5: '', sp_lit_dn_m_6: '', sp_lit_dn_m_7: '', sp_lit_dn_m_8: '', sp_lit_dn_m_9: '', sp_lit_dn_m_10: '', sp_lit_dn_m_11: '', sp_lit_dn_m_12: '', sp_lit_dn_m_total: '',
    sp_lit_dn_t_1: '', sp_lit_dn_t_2: '', sp_lit_dn_t_3: '', sp_lit_dn_t_4: '', sp_lit_dn_t_5: '', sp_lit_dn_t_6: '', sp_lit_dn_t_7: '', sp_lit_dn_t_8: '', sp_lit_dn_t_9: '', sp_lit_dn_t_10: '', sp_lit_dn_t_11: '', sp_lit_dn_t_12: '', sp_lit_dn_t_total: '',

    // Table 10: Illiterate in English (sp_lit_en_) - No Foundation
    sp_lit_en_f_1: '', sp_lit_en_f_2: '', sp_lit_en_f_3: '', sp_lit_en_f_4: '', sp_lit_en_f_5: '', sp_lit_en_f_6: '', sp_lit_en_f_7: '', sp_lit_en_f_8: '', sp_lit_en_f_9: '', sp_lit_en_f_10: '', sp_lit_en_f_11: '', sp_lit_en_f_12: '', sp_lit_en_f_total: '',
    sp_lit_en_m_1: '', sp_lit_en_m_2: '', sp_lit_en_m_3: '', sp_lit_en_m_4: '', sp_lit_en_m_5: '', sp_lit_en_m_6: '', sp_lit_en_m_7: '', sp_lit_en_m_8: '', sp_lit_en_m_9: '', sp_lit_en_m_10: '', sp_lit_en_m_11: '', sp_lit_en_m_12: '', sp_lit_en_m_total: '',
    sp_lit_en_t_1: '', sp_lit_en_t_2: '', sp_lit_en_t_3: '', sp_lit_en_t_4: '', sp_lit_en_t_5: '', sp_lit_en_t_6: '', sp_lit_en_t_7: '', sp_lit_en_t_8: '', sp_lit_en_t_9: '', sp_lit_en_t_10: '', sp_lit_en_t_11: '', sp_lit_en_t_12: '', sp_lit_en_t_total: '',

    // Table 11: Below Grade Level Dhivehi (sp_lit_dg_) - With Foundation
    sp_lit_dg_f_lkg: '', sp_lit_dg_f_ukg: '', sp_lit_dg_f_1: '', sp_lit_dg_f_2: '', sp_lit_dg_f_3: '', sp_lit_dg_f_4: '', sp_lit_dg_f_5: '', sp_lit_dg_f_6: '', sp_lit_dg_f_7: '', sp_lit_dg_f_8: '', sp_lit_dg_f_9: '', sp_lit_dg_f_10: '', sp_lit_dg_f_11: '', sp_lit_dg_f_12: '', sp_lit_dg_f_total: '',
    sp_lit_dg_m_lkg: '', sp_lit_dg_m_ukg: '', sp_lit_dg_m_1: '', sp_lit_dg_m_2: '', sp_lit_dg_m_3: '', sp_lit_dg_m_4: '', sp_lit_dg_m_5: '', sp_lit_dg_m_6: '', sp_lit_dg_m_7: '', sp_lit_dg_m_8: '', sp_lit_dg_m_9: '', sp_lit_dg_m_10: '', sp_lit_dg_m_11: '', sp_lit_dg_m_12: '', sp_lit_dg_m_total: '',
    sp_lit_dg_t_lkg: '', sp_lit_dg_t_ukg: '', sp_lit_dg_t_1: '', sp_lit_dg_t_2: '', sp_lit_dg_t_3: '', sp_lit_dg_t_4: '', sp_lit_dg_t_5: '', sp_lit_dg_t_6: '', sp_lit_dg_t_7: '', sp_lit_dg_t_8: '', sp_lit_dg_t_9: '', sp_lit_dg_t_10: '', sp_lit_dg_t_11: '', sp_lit_dg_t_12: '', sp_lit_dg_t_total: '',

    // Table 12: Below Grade Level English (sp_lit_eg_) - With Foundation
    sp_lit_eg_f_lkg: '', sp_lit_eg_f_ukg: '', sp_lit_eg_f_1: '', sp_lit_eg_f_2: '', sp_lit_eg_f_3: '', sp_lit_eg_f_4: '', sp_lit_eg_f_5: '', sp_lit_eg_f_6: '', sp_lit_eg_f_7: '', sp_lit_eg_f_8: '', sp_lit_eg_f_9: '', sp_lit_eg_f_10: '', sp_lit_eg_f_11: '', sp_lit_eg_f_12: '', sp_lit_eg_f_total: '',
    sp_lit_eg_m_lkg: '', sp_lit_eg_m_ukg: '', sp_lit_eg_m_1: '', sp_lit_eg_m_2: '', sp_lit_eg_m_3: '', sp_lit_eg_m_4: '', sp_lit_eg_m_5: '', sp_lit_eg_m_6: '', sp_lit_eg_m_7: '', sp_lit_eg_m_8: '', sp_lit_eg_m_9: '', sp_lit_eg_m_10: '', sp_lit_eg_m_11: '', sp_lit_eg_m_12: '', sp_lit_eg_m_total: '',
    sp_lit_eg_t_lkg: '', sp_lit_eg_t_ukg: '', sp_lit_eg_t_1: '', sp_lit_eg_t_2: '', sp_lit_eg_t_3: '', sp_lit_eg_t_4: '', sp_lit_eg_t_5: '', sp_lit_eg_t_6: '', sp_lit_eg_t_7: '', sp_lit_eg_t_8: '', sp_lit_eg_t_9: '', sp_lit_eg_t_10: '', sp_lit_eg_t_11: '', sp_lit_eg_t_12: '', sp_lit_eg_t_total: '',

    // Table 13: Below Grade Level Math (sp_lit_mg_) - With Foundation
    sp_lit_mg_f_lkg: '', sp_lit_mg_f_ukg: '', sp_lit_mg_f_1: '', sp_lit_mg_f_2: '', sp_lit_mg_f_3: '', sp_lit_mg_f_4: '', sp_lit_mg_f_5: '', sp_lit_mg_f_6: '', sp_lit_mg_f_7: '', sp_lit_mg_f_8: '', sp_lit_mg_f_9: '', sp_lit_mg_f_10: '', sp_lit_mg_f_11: '', sp_lit_mg_f_12: '', sp_lit_mg_f_total: '',
    sp_lit_mg_m_lkg: '', sp_lit_mg_m_ukg: '', sp_lit_mg_m_1: '', sp_lit_mg_m_2: '', sp_lit_mg_m_3: '', sp_lit_mg_m_4: '', sp_lit_mg_m_5: '', sp_lit_mg_m_6: '', sp_lit_mg_m_7: '', sp_lit_mg_m_8: '', sp_lit_mg_m_9: '', sp_lit_mg_m_10: '', sp_lit_mg_m_11: '', sp_lit_mg_m_12: '', sp_lit_mg_m_total: '',
    sp_lit_mg_t_lkg: '', sp_lit_mg_t_ukg: '', sp_lit_mg_t_1: '', sp_lit_mg_t_2: '', sp_lit_mg_t_3: '', sp_lit_mg_t_4: '', sp_lit_mg_t_5: '', sp_lit_mg_t_6: '', sp_lit_mg_t_7: '', sp_lit_mg_t_8: '', sp_lit_mg_t_9: '', sp_lit_mg_t_10: '', sp_lit_mg_t_11: '', sp_lit_mg_t_12: '', sp_lit_mg_t_total: '',

    // O Level Results
    // Table 1: Current Results
    sp_ol_islam_u: '', sp_ol_islam_e: '', sp_ol_islam_d: '', sp_ol_islam_c: '', sp_ol_islam_b: '', sp_ol_islam_a: '', sp_ol_islam_astar: '', sp_ol_islam_part: '', sp_ol_islam_taken: '',
    sp_ol_dhivehi_u: '', sp_ol_dhivehi_e: '', sp_ol_dhivehi_d: '', sp_ol_dhivehi_c: '', sp_ol_dhivehi_b: '', sp_ol_dhivehi_a: '', sp_ol_dhivehi_astar: '', sp_ol_dhivehi_part: '', sp_ol_dhivehi_taken: '',
    sp_ol_english_u: '', sp_ol_english_e: '', sp_ol_english_d: '', sp_ol_english_c: '', sp_ol_english_b: '', sp_ol_english_a: '', sp_ol_english_astar: '', sp_ol_english_part: '', sp_ol_english_taken: '',
    sp_ol_math_u: '', sp_ol_math_e: '', sp_ol_math_d: '', sp_ol_math_c: '', sp_ol_math_b: '', sp_ol_math_a: '', sp_ol_math_astar: '', sp_ol_math_part: '', sp_ol_math_taken: '',
    sp_ol_chem_u: '', sp_ol_chem_e: '', sp_ol_chem_d: '', sp_ol_chem_c: '', sp_ol_chem_b: '', sp_ol_chem_a: '', sp_ol_chem_astar: '', sp_ol_chem_part: '', sp_ol_chem_taken: '',
    sp_ol_phys_u: '', sp_ol_phys_e: '', sp_ol_phys_d: '', sp_ol_phys_c: '', sp_ol_phys_b: '', sp_ol_phys_a: '', sp_ol_phys_astar: '', sp_ol_phys_part: '', sp_ol_phys_taken: '',
    sp_ol_bio_u: '', sp_ol_bio_e: '', sp_ol_bio_d: '', sp_ol_bio_c: '', sp_ol_bio_b: '', sp_ol_bio_a: '', sp_ol_bio_astar: '', sp_ol_bio_part: '', sp_ol_bio_taken: '',
    sp_ol_marine_u: '', sp_ol_marine_e: '', sp_ol_marine_d: '', sp_ol_marine_c: '', sp_ol_marine_b: '', sp_ol_marine_a: '', sp_ol_marine_astar: '', sp_ol_marine_part: '', sp_ol_marine_taken: '',
    sp_ol_cs_u: '', sp_ol_cs_e: '', sp_ol_cs_d: '', sp_ol_cs_c: '', sp_ol_cs_b: '', sp_ol_cs_a: '', sp_ol_cs_astar: '', sp_ol_cs_part: '', sp_ol_cs_taken: '',
    sp_ol_acc_u: '', sp_ol_acc_e: '', sp_ol_acc_d: '', sp_ol_acc_c: '', sp_ol_acc_b: '', sp_ol_acc_a: '', sp_ol_acc_astar: '', sp_ol_acc_part: '', sp_ol_acc_taken: '',
    sp_ol_bus_u: '', sp_ol_bus_e: '', sp_ol_bus_d: '', sp_ol_bus_c: '', sp_ol_bus_b: '', sp_ol_bus_a: '', sp_ol_bus_astar: '', sp_ol_bus_part: '', sp_ol_bus_taken: '',
    sp_ol_econ_u: '', sp_ol_econ_e: '', sp_ol_econ_d: '', sp_ol_econ_c: '', sp_ol_econ_b: '', sp_ol_econ_a: '', sp_ol_econ_astar: '', sp_ol_econ_part: '', sp_ol_econ_taken: '',
    sp_ol_tt_u: '', sp_ol_tt_e: '', sp_ol_tt_d: '', sp_ol_tt_c: '', sp_ol_tt_b: '', sp_ol_tt_a: '', sp_ol_tt_astar: '', sp_ol_tt_part: '', sp_ol_tt_taken: '',
    sp_ol_hist_u: '', sp_ol_hist_e: '', sp_ol_hist_d: '', sp_ol_hist_c: '', sp_ol_hist_b: '', sp_ol_hist_a: '', sp_ol_hist_astar: '', sp_ol_hist_part: '', sp_ol_hist_taken: '',
    sp_ol_geo_u: '', sp_ol_geo_e: '', sp_ol_geo_d: '', sp_ol_geo_c: '', sp_ol_geo_b: '', sp_ol_geo_a: '', sp_ol_geo_astar: '', sp_ol_geo_part: '', sp_ol_geo_taken: '',
    sp_ol_lit_u: '', sp_ol_lit_e: '', sp_ol_lit_d: '', sp_ol_lit_c: '', sp_ol_lit_b: '', sp_ol_lit_a: '', sp_ol_lit_astar: '', sp_ol_lit_part: '', sp_ol_lit_taken: '',
    sp_ol_art_u: '', sp_ol_art_e: '', sp_ol_art_d: '', sp_ol_art_c: '', sp_ol_art_b: '', sp_ol_art_a: '', sp_ol_art_astar: '', sp_ol_art_part: '', sp_ol_art_taken: '',
    sp_ol_btec_u: '', sp_ol_btec_e: '', sp_ol_btec_d: '', sp_ol_btec_c: '', sp_ol_btec_b: '', sp_ol_btec_a: '', sp_ol_btec_astar: '', sp_ol_btec_part: '', sp_ol_btec_taken: '',
    sp_ol_other1_name: '', sp_ol_other1_u: '', sp_ol_other1_e: '', sp_ol_other1_d: '', sp_ol_other1_c: '', sp_ol_other1_b: '', sp_ol_other1_a: '', sp_ol_other1_astar: '', sp_ol_other1_part: '', sp_ol_other1_taken: '',
    sp_ol_other2_name: '', sp_ol_other2_u: '', sp_ol_other2_e: '', sp_ol_other2_d: '', sp_ol_other2_c: '', sp_ol_other2_b: '', sp_ol_other2_a: '', sp_ol_other2_astar: '', sp_ol_other2_part: '', sp_ol_other2_taken: '',
    sp_ol_5pass_percent: '',

    // Table 2: O Level Trends (3 Years) - format: sp_ol_tr_[year]_[subject]_[metric]
    // metric: pass_pct, pass_count, part_count, taken_count
    // subjects: islam, dhivehi, math, english, acc, bus, econ, phys, chem, bio, tt, cs, art, btec
    // years: 2021_2022, 2020, 2019

    // A Level Results
    // Table 3: Current Results (U, E, D, C, B, A, A*)
    sp_al_islam_u: '', sp_al_islam_e: '', sp_al_islam_d: '', sp_al_islam_c: '', sp_al_islam_b: '', sp_al_islam_a: '', sp_al_islam_astar: '', sp_al_islam_part: '', sp_al_islam_taken: '',
    sp_al_dhivehi_u: '', sp_al_dhivehi_e: '', sp_al_dhivehi_d: '', sp_al_dhivehi_c: '', sp_al_dhivehi_b: '', sp_al_dhivehi_a: '', sp_al_dhivehi_astar: '', sp_al_dhivehi_part: '', sp_al_dhivehi_taken: '',
    sp_al_english_u: '', sp_al_english_e: '', sp_al_english_d: '', sp_al_english_c: '', sp_al_english_b: '', sp_al_english_a: '', sp_al_english_astar: '', sp_al_english_part: '', sp_al_english_taken: '',
    sp_al_math_u: '', sp_al_math_e: '', sp_al_math_d: '', sp_al_math_c: '', sp_al_math_b: '', sp_al_math_a: '', sp_al_math_astar: '', sp_al_math_part: '', sp_al_math_taken: '',
    sp_al_chem_u: '', sp_al_chem_e: '', sp_al_chem_d: '', sp_al_chem_c: '', sp_al_chem_b: '', sp_al_chem_a: '', sp_al_chem_astar: '', sp_al_chem_part: '', sp_al_chem_taken: '',
    sp_al_phys_u: '', sp_al_phys_e: '', sp_al_phys_d: '', sp_al_phys_c: '', sp_al_phys_b: '', sp_al_phys_a: '', sp_al_phys_astar: '', sp_al_phys_part: '', sp_al_phys_taken: '',
    sp_al_bio_u: '', sp_al_bio_e: '', sp_al_bio_d: '', sp_al_bio_c: '', sp_al_bio_b: '', sp_al_bio_a: '', sp_al_bio_astar: '', sp_al_bio_part: '', sp_al_bio_taken: '',
    sp_al_marine_u: '', sp_al_marine_e: '', sp_al_marine_d: '', sp_al_marine_c: '', sp_al_marine_b: '', sp_al_marine_a: '', sp_al_marine_astar: '', sp_al_marine_part: '', sp_al_marine_taken: '',
    sp_al_cs_u: '', sp_al_cs_e: '', sp_al_cs_d: '', sp_al_cs_c: '', sp_al_cs_b: '', sp_al_cs_a: '', sp_al_cs_astar: '', sp_al_cs_part: '', sp_al_cs_taken: '',
    sp_al_acc_u: '', sp_al_acc_e: '', sp_al_acc_d: '', sp_al_acc_c: '', sp_al_acc_b: '', sp_al_acc_a: '', sp_al_acc_astar: '', sp_al_acc_part: '', sp_al_acc_taken: '',
    sp_al_bus_u: '', sp_al_bus_e: '', sp_al_bus_d: '', sp_al_bus_c: '', sp_al_bus_b: '', sp_al_bus_a: '', sp_al_bus_astar: '', sp_al_bus_part: '', sp_al_bus_taken: '',
    sp_al_econ_u: '', sp_al_econ_e: '', sp_al_econ_d: '', sp_al_econ_c: '', sp_al_econ_b: '', sp_al_econ_a: '', sp_al_econ_astar: '', sp_al_econ_part: '', sp_al_econ_taken: '',
    sp_al_tt_u: '', sp_al_tt_e: '', sp_al_tt_d: '', sp_al_tt_c: '', sp_al_tt_b: '', sp_al_tt_a: '', sp_al_tt_astar: '', sp_al_tt_part: '', sp_al_tt_taken: '',
    sp_al_hist_u: '', sp_al_hist_e: '', sp_al_hist_d: '', sp_al_hist_c: '', sp_al_hist_b: '', sp_al_hist_a: '', sp_al_hist_astar: '', sp_al_hist_part: '', sp_al_hist_taken: '',
    sp_al_geo_u: '', sp_al_geo_e: '', sp_al_geo_d: '', sp_al_geo_c: '', sp_al_geo_b: '', sp_al_geo_a: '', sp_al_geo_astar: '', sp_al_geo_part: '', sp_al_geo_taken: '',
    sp_al_lit_u: '', sp_al_lit_e: '', sp_al_lit_d: '', sp_al_lit_c: '', sp_al_lit_b: '', sp_al_lit_a: '', sp_al_lit_astar: '', sp_al_lit_part: '', sp_al_lit_taken: '',
    sp_al_art_u: '', sp_al_art_e: '', sp_al_art_d: '', sp_al_art_c: '', sp_al_art_b: '', sp_al_art_a: '', sp_al_art_astar: '', sp_al_art_part: '', sp_al_art_taken: '',
    sp_al_other1_name: '', sp_al_other1_u: '', sp_al_other1_e: '', sp_al_other1_d: '', sp_al_other1_c: '', sp_al_other1_b: '', sp_al_other1_a: '', sp_al_other1_astar: '', sp_al_other1_part: '', sp_al_other1_taken: '',
    sp_al_other2_name: '', sp_al_other2_u: '', sp_al_other2_e: '', sp_al_other2_d: '', sp_al_other2_c: '', sp_al_other2_b: '', sp_al_other2_a: '', sp_al_other2_astar: '', sp_al_other2_part: '', sp_al_other2_taken: '',
    sp_al_5pass_percent: '',

    // School Exam Results (Grades 7, 8, 9, 10, 11, 12)
    // format: sp_se_[grade]_[subject]_[metric]
    // metric: pass_pct, pass_count, part_count, taken_count

    // Grade 7
    sp_se_gr7_islam_pass_pct: '', sp_se_gr7_islam_pass_count: '', sp_se_gr7_islam_part: '', sp_se_gr7_islam_taken: '',
    sp_se_gr7_dhivehi_pass_pct: '', sp_se_gr7_dhivehi_pass_count: '', sp_se_gr7_dhivehi_part: '', sp_se_gr7_dhivehi_taken: '',
    sp_se_gr7_english_pass_pct: '', sp_se_gr7_english_pass_count: '', sp_se_gr7_english_part: '', sp_se_gr7_english_taken: '',
    sp_se_gr7_math_pass_pct: '', sp_se_gr7_math_pass_count: '', sp_se_gr7_math_part: '', sp_se_gr7_math_taken: '',
    sp_se_gr7_science_pass_pct: '', sp_se_gr7_science_pass_count: '', sp_se_gr7_science_part: '', sp_se_gr7_science_taken: '',
    sp_se_gr7_bus_pass_pct: '', sp_se_gr7_bus_pass_count: '', sp_se_gr7_bus_part: '', sp_se_gr7_bus_taken: '',
    sp_se_gr7_outcomes_pass_pct: '', sp_se_gr7_outcomes_pass_count: '', sp_se_gr7_outcomes_part: '', sp_se_gr7_outcomes_taken: '',
    sp_se_gr7_avg_pass_pct: '', sp_se_gr7_avg_pass_count: '', sp_se_gr7_avg_part: '', sp_se_gr7_avg_taken: '',
    sp_se_gr7_target_met: false,

    // Grade 8 & 9 (Similar subjects)
    // Common Subjects: Islam, Dhivehi, English, Math, Chem, Phys, Bio, Marine, Acc, Bus, Econ, TT, Hist, Geo, Lit, Art
    // Grade 8
    sp_se_gr8_islam_pass_pct: '', sp_se_gr8_islam_pass_count: '', sp_se_gr8_islam_part: '', sp_se_gr8_islam_taken: '',
    sp_se_gr8_dhivehi_pass_pct: '', sp_se_gr8_dhivehi_pass_count: '', sp_se_gr8_dhivehi_part: '', sp_se_gr8_dhivehi_taken: '',
    sp_se_gr8_english_pass_pct: '', sp_se_gr8_english_pass_count: '', sp_se_gr8_english_part: '', sp_se_gr8_english_taken: '',
    sp_se_gr8_math_pass_pct: '', sp_se_gr8_math_pass_count: '', sp_se_gr8_math_part: '', sp_se_gr8_math_taken: '',
    sp_se_gr8_chem_pass_pct: '', sp_se_gr8_chem_pass_count: '', sp_se_gr8_chem_part: '', sp_se_gr8_chem_taken: '',
    sp_se_gr8_phys_pass_pct: '', sp_se_gr8_phys_pass_count: '', sp_se_gr8_phys_part: '', sp_se_gr8_phys_taken: '',
    sp_se_gr8_bio_pass_pct: '', sp_se_gr8_bio_pass_count: '', sp_se_gr8_bio_part: '', sp_se_gr8_bio_taken: '',
    sp_se_gr8_marine_pass_pct: '', sp_se_gr8_marine_pass_count: '', sp_se_gr8_marine_part: '', sp_se_gr8_marine_taken: '',
    sp_se_gr8_acc_pass_pct: '', sp_se_gr8_acc_pass_count: '', sp_se_gr8_acc_part: '', sp_se_gr8_acc_taken: '',
    sp_se_gr8_bus_pass_pct: '', sp_se_gr8_bus_pass_count: '', sp_se_gr8_bus_part: '', sp_se_gr8_bus_taken: '',
    sp_se_gr8_econ_pass_pct: '', sp_se_gr8_econ_pass_count: '', sp_se_gr8_econ_part: '', sp_se_gr8_econ_taken: '',
    sp_se_gr8_tt_pass_pct: '', sp_se_gr8_tt_pass_count: '', sp_se_gr8_tt_part: '', sp_se_gr8_tt_taken: '',
    sp_se_gr8_hist_pass_pct: '', sp_se_gr8_hist_pass_count: '', sp_se_gr8_hist_part: '', sp_se_gr8_hist_taken: '',
    sp_se_gr8_geo_pass_pct: '', sp_se_gr8_geo_pass_count: '', sp_se_gr8_geo_part: '', sp_se_gr8_geo_taken: '',
    sp_se_gr8_lit_pass_pct: '', sp_se_gr8_lit_pass_count: '', sp_se_gr8_lit_part: '', sp_se_gr8_lit_taken: '',
    sp_se_gr8_art_pass_pct: '', sp_se_gr8_art_pass_count: '', sp_se_gr8_art_part: '', sp_se_gr8_art_taken: '',
    sp_se_gr8_avg_pass_pct: '', sp_se_gr8_avg_pass_count: '', sp_se_gr8_avg_part: '', sp_se_gr8_avg_taken: '',
    sp_se_gr8_target_met: false,

    // Grade 9 (Same as 8)
    sp_se_gr9_islam_pass_pct: '', sp_se_gr9_islam_pass_count: '', sp_se_gr9_islam_part: '', sp_se_gr9_islam_taken: '',
    sp_se_gr9_dhivehi_pass_pct: '', sp_se_gr9_dhivehi_pass_count: '', sp_se_gr9_dhivehi_part: '', sp_se_gr9_dhivehi_taken: '',
    sp_se_gr9_english_pass_pct: '', sp_se_gr9_english_pass_count: '', sp_se_gr9_english_part: '', sp_se_gr9_english_taken: '',
    sp_se_gr9_math_pass_pct: '', sp_se_gr9_math_pass_count: '', sp_se_gr9_math_part: '', sp_se_gr9_math_taken: '',
    sp_se_gr9_chem_pass_pct: '', sp_se_gr9_chem_pass_count: '', sp_se_gr9_chem_part: '', sp_se_gr9_chem_taken: '',
    sp_se_gr9_phys_pass_pct: '', sp_se_gr9_phys_pass_count: '', sp_se_gr9_phys_part: '', sp_se_gr9_phys_taken: '',
    sp_se_gr9_bio_pass_pct: '', sp_se_gr9_bio_pass_count: '', sp_se_gr9_bio_part: '', sp_se_gr9_bio_taken: '',
    sp_se_gr9_marine_pass_pct: '', sp_se_gr9_marine_pass_count: '', sp_se_gr9_marine_part: '', sp_se_gr9_marine_taken: '',
    sp_se_gr9_acc_pass_pct: '', sp_se_gr9_acc_pass_count: '', sp_se_gr9_acc_part: '', sp_se_gr9_acc_taken: '',
    sp_se_gr9_bus_pass_pct: '', sp_se_gr9_bus_pass_count: '', sp_se_gr9_bus_part: '', sp_se_gr9_bus_taken: '',
    sp_se_gr9_econ_pass_pct: '', sp_se_gr9_econ_pass_count: '', sp_se_gr9_econ_part: '', sp_se_gr9_econ_taken: '',
    sp_se_gr9_tt_pass_pct: '', sp_se_gr9_tt_pass_count: '', sp_se_gr9_tt_part: '', sp_se_gr9_tt_taken: '',
    sp_se_gr9_hist_pass_pct: '', sp_se_gr9_hist_pass_count: '', sp_se_gr9_hist_part: '', sp_se_gr9_hist_taken: '',
    sp_se_gr9_geo_pass_pct: '', sp_se_gr9_geo_pass_count: '', sp_se_gr9_geo_part: '', sp_se_gr9_geo_taken: '',
    sp_se_gr9_lit_pass_pct: '', sp_se_gr9_lit_pass_count: '', sp_se_gr9_lit_part: '', sp_se_gr9_lit_taken: '',
    sp_se_gr9_art_pass_pct: '', sp_se_gr9_art_pass_count: '', sp_se_gr9_art_part: '', sp_se_gr9_art_taken: '',
    sp_se_gr9_avg_pass_pct: '', sp_se_gr9_avg_pass_count: '', sp_se_gr9_avg_part: '', sp_se_gr9_avg_taken: '',
    sp_se_gr9_target_met: false,

    // Grade 10 (Same as 8/9)
    sp_se_gr10_islam_pass_pct: '', sp_se_gr10_islam_pass_count: '', sp_se_gr10_islam_part: '', sp_se_gr10_islam_taken: '',
    sp_se_gr10_dhivehi_pass_pct: '', sp_se_gr10_dhivehi_pass_count: '', sp_se_gr10_dhivehi_part: '', sp_se_gr10_dhivehi_taken: '',
    sp_se_gr10_english_pass_pct: '', sp_se_gr10_english_pass_count: '', sp_se_gr10_english_part: '', sp_se_gr10_english_taken: '',
    sp_se_gr10_math_pass_pct: '', sp_se_gr10_math_pass_count: '', sp_se_gr10_math_part: '', sp_se_gr10_math_taken: '',
    sp_se_gr10_chem_pass_pct: '', sp_se_gr10_chem_pass_count: '', sp_se_gr10_chem_part: '', sp_se_gr10_chem_taken: '',
    sp_se_gr10_phys_pass_pct: '', sp_se_gr10_phys_pass_count: '', sp_se_gr10_phys_part: '', sp_se_gr10_phys_taken: '',
    sp_se_gr10_bio_pass_pct: '', sp_se_gr10_bio_pass_count: '', sp_se_gr10_bio_part: '', sp_se_gr10_bio_taken: '',
    sp_se_gr10_marine_pass_pct: '', sp_se_gr10_marine_pass_count: '', sp_se_gr10_marine_part: '', sp_se_gr10_marine_taken: '',
    sp_se_gr10_acc_pass_pct: '', sp_se_gr10_acc_pass_count: '', sp_se_gr10_acc_part: '', sp_se_gr10_acc_taken: '',
    sp_se_gr10_bus_pass_pct: '', sp_se_gr10_bus_pass_count: '', sp_se_gr10_bus_part: '', sp_se_gr10_bus_taken: '',
    sp_se_gr10_econ_pass_pct: '', sp_se_gr10_econ_pass_count: '', sp_se_gr10_econ_part: '', sp_se_gr10_econ_taken: '',
    sp_se_gr10_tt_pass_pct: '', sp_se_gr10_tt_pass_count: '', sp_se_gr10_tt_part: '', sp_se_gr10_tt_taken: '',
    sp_se_gr10_hist_pass_pct: '', sp_se_gr10_hist_pass_count: '', sp_se_gr10_hist_part: '', sp_se_gr10_hist_taken: '',
    sp_se_gr10_geo_pass_pct: '', sp_se_gr10_geo_pass_count: '', sp_se_gr10_geo_part: '', sp_se_gr10_geo_taken: '',
    sp_se_gr10_lit_pass_pct: '', sp_se_gr10_lit_pass_count: '', sp_se_gr10_lit_part: '', sp_se_gr10_lit_taken: '',
    sp_se_gr10_art_pass_pct: '', sp_se_gr10_art_pass_count: '', sp_se_gr10_art_part: '', sp_se_gr10_art_taken: '',
    sp_se_gr10_avg_pass_pct: '', sp_se_gr10_avg_pass_count: '', sp_se_gr10_avg_part: '', sp_se_gr10_avg_taken: '',
    sp_se_gr10_target_met: false,

    // Grade 11 & 12 (Higher Sec Subjects)
    // Islam, Dhivehi, English, Math, Further Math, Chem, Phys, Bio, Marine, Acc, Bus, Econ, TT, Psych, Hist, Geo, Lit, Art
    // Grade 11
    sp_se_gr11_islam_pass_pct: '', sp_se_gr11_islam_pass_count: '', sp_se_gr11_islam_part: '', sp_se_gr11_islam_taken: '',
    sp_se_gr11_dhivehi_pass_pct: '', sp_se_gr11_dhivehi_pass_count: '', sp_se_gr11_dhivehi_part: '', sp_se_gr11_dhivehi_taken: '',
    sp_se_gr11_english_pass_pct: '', sp_se_gr11_english_pass_count: '', sp_se_gr11_english_part: '', sp_se_gr11_english_taken: '',
    sp_se_gr11_math_pass_pct: '', sp_se_gr11_math_pass_count: '', sp_se_gr11_math_part: '', sp_se_gr11_math_taken: '',
    sp_se_gr11_fmath_pass_pct: '', sp_se_gr11_fmath_pass_count: '', sp_se_gr11_fmath_part: '', sp_se_gr11_fmath_taken: '',
    sp_se_gr11_chem_pass_pct: '', sp_se_gr11_chem_pass_count: '', sp_se_gr11_chem_part: '', sp_se_gr11_chem_taken: '',
    sp_se_gr11_phys_pass_pct: '', sp_se_gr11_phys_pass_count: '', sp_se_gr11_phys_part: '', sp_se_gr11_phys_taken: '',
    sp_se_gr11_bio_pass_pct: '', sp_se_gr11_bio_pass_count: '', sp_se_gr11_bio_part: '', sp_se_gr11_bio_taken: '',
    sp_se_gr11_marine_pass_pct: '', sp_se_gr11_marine_pass_count: '', sp_se_gr11_marine_part: '', sp_se_gr11_marine_taken: '',
    sp_se_gr11_acc_pass_pct: '', sp_se_gr11_acc_pass_count: '', sp_se_gr11_acc_part: '', sp_se_gr11_acc_taken: '',
    sp_se_gr11_bus_pass_pct: '', sp_se_gr11_bus_pass_count: '', sp_se_gr11_bus_part: '', sp_se_gr11_bus_taken: '',
    sp_se_gr11_econ_pass_pct: '', sp_se_gr11_econ_pass_count: '', sp_se_gr11_econ_part: '', sp_se_gr11_econ_taken: '',
    sp_se_gr11_tt_pass_pct: '', sp_se_gr11_tt_pass_count: '', sp_se_gr11_tt_part: '', sp_se_gr11_tt_taken: '',
    sp_se_gr11_psych_pass_pct: '', sp_se_gr11_psych_pass_count: '', sp_se_gr11_psych_part: '', sp_se_gr11_psych_taken: '',
    sp_se_gr11_hist_pass_pct: '', sp_se_gr11_hist_pass_count: '', sp_se_gr11_hist_part: '', sp_se_gr11_hist_taken: '',
    sp_se_gr11_geo_pass_pct: '', sp_se_gr11_geo_pass_count: '', sp_se_gr11_geo_part: '', sp_se_gr11_geo_taken: '',
    sp_se_gr11_lit_pass_pct: '', sp_se_gr11_lit_pass_count: '', sp_se_gr11_lit_part: '', sp_se_gr11_lit_taken: '',
    sp_se_gr11_art_pass_pct: '', sp_se_gr11_art_pass_count: '', sp_se_gr11_art_part: '', sp_se_gr11_art_taken: '',
    sp_se_gr11_avg_pass_pct: '', sp_se_gr11_avg_pass_count: '', sp_se_gr11_avg_part: '', sp_se_gr11_avg_taken: '',
    sp_se_gr11_target_met: false,

    // Grade 12 (Same as 11)
    sp_se_gr12_islam_pass_pct: '', sp_se_gr12_islam_pass_count: '', sp_se_gr12_islam_part: '', sp_se_gr12_islam_taken: '',
    sp_se_gr12_dhivehi_pass_pct: '', sp_se_gr12_dhivehi_pass_count: '', sp_se_gr12_dhivehi_part: '', sp_se_gr12_dhivehi_taken: '',
    sp_se_gr12_english_pass_pct: '', sp_se_gr12_english_pass_count: '', sp_se_gr12_english_part: '', sp_se_gr12_english_taken: '',
    sp_se_gr12_math_pass_pct: '', sp_se_gr12_math_pass_count: '', sp_se_gr12_math_part: '', sp_se_gr12_math_taken: '',
    sp_se_gr12_fmath_pass_pct: '', sp_se_gr12_fmath_pass_count: '', sp_se_gr12_fmath_part: '', sp_se_gr12_fmath_taken: '',
    sp_se_gr12_chem_pass_pct: '', sp_se_gr12_chem_pass_count: '', sp_se_gr12_chem_part: '', sp_se_gr12_chem_taken: '',
    sp_se_gr12_phys_pass_pct: '', sp_se_gr12_phys_pass_count: '', sp_se_gr12_phys_part: '', sp_se_gr12_phys_taken: '',
    sp_se_gr12_bio_pass_pct: '', sp_se_gr12_bio_pass_count: '', sp_se_gr12_bio_part: '', sp_se_gr12_bio_taken: '',
    sp_se_gr12_marine_pass_pct: '', sp_se_gr12_marine_pass_count: '', sp_se_gr12_marine_part: '', sp_se_gr12_marine_taken: '',
    sp_se_gr12_acc_pass_pct: '', sp_se_gr12_acc_pass_count: '', sp_se_gr12_acc_part: '', sp_se_gr12_acc_taken: '',
    sp_se_gr12_bus_pass_pct: '', sp_se_gr12_bus_pass_count: '', sp_se_gr12_bus_part: '', sp_se_gr12_bus_taken: '',
    sp_se_gr12_econ_pass_pct: '', sp_se_gr12_econ_pass_count: '', sp_se_gr12_econ_part: '', sp_se_gr12_econ_taken: '',
    sp_se_gr12_tt_pass_pct: '', sp_se_gr12_tt_pass_count: '', sp_se_gr12_tt_part: '', sp_se_gr12_tt_taken: '',
    sp_se_gr12_psych_pass_pct: '', sp_se_gr12_psych_pass_count: '', sp_se_gr12_psych_part: '', sp_se_gr12_psych_taken: '',
    sp_se_gr12_hist_pass_pct: '', sp_se_gr12_hist_pass_count: '', sp_se_gr12_hist_part: '', sp_se_gr12_hist_taken: '',
    sp_se_gr12_geo_pass_pct: '', sp_se_gr12_geo_pass_count: '', sp_se_gr12_geo_part: '', sp_se_gr12_geo_taken: '',
    sp_se_gr12_lit_pass_pct: '', sp_se_gr12_lit_pass_count: '', sp_se_gr12_lit_part: '', sp_se_gr12_lit_taken: '',
    sp_se_gr12_art_pass_pct: '', sp_se_gr12_art_pass_count: '', sp_se_gr12_art_part: '', sp_se_gr12_art_taken: '',
    sp_se_gr12_avg_pass_pct: '', sp_se_gr12_avg_pass_count: '', sp_se_gr12_avg_part: '', sp_se_gr12_avg_taken: '',
    sp_se_gr12_target_met: false,

    // Resources Tab
    // Section 14: Learning & Teaching Resources
    // 14.1 Classrooms
    sp_res_lt1_cr_req: '', sp_res_lt1_cr_avail: '', sp_res_lt1_book_storage: false,
    // 14.2 Library
    sp_res_lt2_library: false, sp_res_lt2_books_all_ages: false, sp_res_lt2_ref_books: false,
    // 14.3 Science Lab
    sp_res_lt3_lab: false, sp_res_lt3_chemical_storage: false, sp_res_lt3_equipment: false, sp_res_lt3_chemicals: false,
    // 14.4 Computer Lab
    sp_res_lt4_comp_room: false, sp_res_lt4_comp_systems: false, sp_res_lt4_internet: false,
    // 14.5 Outdoor Area
    sp_res_lt5_outdoor: false, sp_res_lt5_outdoor_items: false,
    // 14.6 Printer
    sp_res_lt6_printer: false, sp_res_lt6_print_room: false,
    // 14.7 SEN Room
    sp_res_lt7_sen_room: false,
    // 14.8 HPE Area
    sp_res_lt8_hpe_area: false,

    // Section 14: Staff Resources
    // 14.1 Staff Work Environment
    sp_res_sf1_principal_office: false, sp_res_sf1_dp_office: false, sp_res_sf1_admin_office: false,
    sp_res_sf1_lt_office: false, sp_res_sf1_staff_room: false, sp_res_sf1_other_office: false,
    sp_res_sf1_admin_staff_office: false, sp_res_sf1_support_office: false,
    // 14.2 Staff Furniture
    sp_res_sf2_principal_furn: false, sp_res_sf2_dp_furn: false, sp_res_sf2_admin_furn: false,
    sp_res_sf2_lt_chair_desk: false, sp_res_sf2_lt_locker: false,
    sp_res_sf2_teacher_chair_desk: false, sp_res_sf2_teacher_locker: false,
    sp_res_sf2_other_furn: false, sp_res_sf2_admin_staff_furn: false, sp_res_sf2_support_furn: false,
    // 14.3 Staff Resources (Internet, Computer, Phone)
    sp_res_sf3_principal_res: false, sp_res_sf3_dp_res: false, sp_res_sf3_admin_res: false,
    sp_res_sf3_lt_res: false, sp_res_sf3_teacher_res: false, sp_res_sf3_other_res: false,
    sp_res_sf3_admin_staff_res: false,

    // Section 15: Extra Activities Resources
    sp_res_ex1_sports_area: false,
    sp_res_ex2_sports_items: false, sp_res_ex2_sports_storage: false,
    sp_res_ex3_wudu: false, sp_res_ex3_prayer: false,
    sp_res_ex4_hall: false,

    // Section 16: Health & Safety Resources
    // 16.1 First Aid
    sp_res_hs1_first_aid_room: false, sp_res_hs1_first_aid_items: false, sp_res_hs1_items_usable: false,
    // 16.2 Safe Water
    sp_res_hs2_safe_water: false, sp_res_hs2_water_access: false,
    // 16.3 Toilets
    sp_res_hs3_female_toilet_req: '', sp_res_hs3_female_toilet_avail: '',
    sp_res_hs3_male_toilet_req: '', sp_res_hs3_male_toilet_avail: '',
    sp_res_hs3_female_staff_toilet: false, sp_res_hs3_male_staff_toilet: false,
    sp_res_hs3_foundation_toilet: false, sp_res_hs3_sen_toilet: false,
    // 16.4 Hand Washing
    sp_res_hs4_hand_wash: false,
    // 16.5 Counseling Room
    sp_res_hs5_counseling_room: false,
    // 16.6 Fire Extinguishers
    sp_res_hs6_fire_ext_req: '', sp_res_hs6_fire_ext_avail: '',
    // 16.7 Safe Room
    sp_res_hs7_safe_room: false,

    // Extracurricular Activities
    sp_ec_religious_target: '',
    sp_ec_religious_part: '',
    sp_ec_literary_target: '',
    sp_ec_literary_part: '',
    sp_ec_sports_target: '',
    sp_ec_sports_part: '',
    sp_ec_club_part: '',
    sp_ec_uniform_part: '',

    // Student Conduct
    sp_conduct_attendance_avg: '',
    sp_conduct_no_issues_pct: '',
    sp_conduct_school_issues_pct: '',
    sp_conduct_juvenile_issues_pct: '',

    // School Leavers - Grade 10
    sp_leaver_g10_completed: '',
    sp_leaver_g10_studying_g11: '',
    sp_leaver_g10_higher_ed: '',
    sp_leaver_g10_employed: '',

    // School Leavers - Grade 12
    sp_leaver_g12_completed: '',
    sp_leaver_g12_higher_ed: '',
    sp_leaver_g12_employed: '',
};

// Removed hardcoded SCHOOL_ID

// ==========================================
// Custom Debounce Hook
// ==========================================
function useDebouncedCallback(callback, delay) {
    const timeoutRef = useRef(null);
    return useCallback((...args) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            callback(...args);
        }, delay);
    }, [callback, delay]);
}

// ==========================================
// Virtualized Staff List Component
// ==========================================
const VirtualStaffList = ({ staffList, handleStaffChange, handleRemoveStaff, parentRef }) => {
    "use no memo";
    // Set up the virtualizer for the table rows
    // eslint-disable-next-line
    const rowVirtualizer = useVirtualizer({
        count: staffList.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 50, // estimated pixel height per row
        overscan: 5, // Render 5 rows off-screen for smooth scrolling
    });

    if (staffList.length === 0) {
        return (
            <tr>
                <td colSpan="9" className="text-center p-4 text-gray-500 border" style={{ fontStyle: 'italic' }}>
                    No staff added yet. Click "+ Add Staff" to begin.
                </td>
            </tr>
        );
    }

    return (
        // We inject the parentRef into a dedicated scrollable tbody wrapper if possible, 
        // but react-virtual v3 works best wrapping the entire mapping block or placing the ref on the scroll-container
        <>
            {/* 
               In a native HTML table, we apply the total height to a spacer row 
               or manage the Y-transforms on the TR elements.
            */}
            <tr style={{ height: `${rowVirtualizer.getTotalSize()}px`, display: 'block', position: 'relative', width: '100%' }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const index = virtualRow.index;
                    const staff = staffList[index];
                    return (
                        <tr
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            className={index % 2 !== 0 ? 'bg-gray-50' : ''}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                                transition: 'background 0.15s',
                                display: 'table', // Keep table-row semantics
                                tableLayout: 'fixed'
                            }}
                        >
                            <td className="p-1 border w-32"><input type="text" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.name || ''} onChange={(e) => handleStaffChange(index, 'name', e.target.value)} /></td>
                            <td className="p-1 border w-24"><input type="text" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.designation || ''} onChange={(e) => handleStaffChange(index, 'designation', e.target.value)} /></td>
                            <td className="p-1 border w-24"><input type="text" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.qualification || ''} onChange={(e) => handleStaffChange(index, 'qualification', e.target.value)} /></td>
                            <td className="p-1 border w-20"><input type="text" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.currentPostDuration || ''} onChange={(e) => handleStaffChange(index, 'currentPostDuration', e.target.value)} /></td>
                            <td className="p-1 border w-20"><input type="text" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.teacherDuration || ''} onChange={(e) => handleStaffChange(index, 'teacherDuration', e.target.value)} /></td>
                            <td className="p-1 border w-20"><input type="text" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.educationDuration || ''} onChange={(e) => handleStaffChange(index, 'educationDuration', e.target.value)} /></td>
                            <td className="p-1 border w-24"><input type="text" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.certificate || ''} onChange={(e) => handleStaffChange(index, 'certificate', e.target.value)} placeholder="..." /></td>
                            <td className="p-1 border w-24"><input type="tel" className="form-input w-full text-xs rounded-md shadow-sm border-gray-300" value={staff.mobile || ''} onChange={(e) => handleStaffChange(index, 'mobile', e.target.value)} /></td>
                            <td className="p-1 border text-center w-10">
                                <button onClick={() => handleRemoveStaff(index)} style={{ color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', background: 'none', border: 'none' }}>✗</button>
                            </td>
                        </tr>
                    );
                })}
            </tr>
        </>
    );
};

function SchoolProfile() {
    const { currentSchoolId, currentSchool } = useSSEData();
    const { user } = useAuth();
    const [formData, setFormData] = useState(initialFormData);
    const [activeTab, setActiveTab] = useState('basic');
    const contentRef = useRef(null);
    const staffListParentRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSyncTime, setLastSyncTime] = useState(null);

    // Convex Real-Time Data
    const profileData = useQuery(api.schoolProfile.getBySchool,
        currentSchoolId ? { schoolId: currentSchoolId } : "skip"
    );
    const updateProfileMutation = useMutation(api.schoolProfile.updateFields);

    // Track pending updates to batch them
    const pendingUpdates = useRef({});
    // Track if we've done the initial load from Convex
    const hasLoadedRef = useRef(false);

    // Monitor online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Load initial data from Convex
    useEffect(() => {
        if (profileData && profileData.data && !hasLoadedRef.current) {
            setFormData(prev => ({
                ...prev,
                ...profileData.data
            }));
            hasLoadedRef.current = true;
            if (profileData.lastUpdatedAt) {
                setLastSyncTime(profileData.lastUpdatedAt);
            }
        }
    }, [profileData]);

    // Reset loaded ref when school changes
    useEffect(() => {
        hasLoadedRef.current = false;
        setFormData(initialFormData); // Clear form while loading
    }, [currentSchoolId]);

    // Perform the actual save to Convex
    const performSave = useCallback(async () => {
        if (!currentSchoolId || !user?.email || Object.keys(pendingUpdates.current).length === 0) return;

        setIsSaving(true);
        const updatesToSave = { ...pendingUpdates.current };
        pendingUpdates.current = {}; // clear immediately so new edits are caught

        try {
            await updateProfileMutation({
                schoolId: currentSchoolId,
                updates: updatesToSave,
                updatedBy: user.email,
            });
            setLastSyncTime(Date.now());
        } catch (err) {
            console.error("Failed to save profile:", err);
            alert("Failed to save profile changes. Changes will be retried automatically. Please check your connection.");
            // Re-merge failed updates back into pending
            pendingUpdates.current = { ...updatesToSave, ...pendingUpdates.current };
        } finally {
            setIsSaving(false);
        }
    }, [currentSchoolId, user, updateProfileMutation]);

    const debouncedSave = useDebouncedCallback(performSave, 1500);

    // Centralized updater for form data
    const updateFormData = (changes) => {
        if (!changes || Object.keys(changes).length === 0) return;
        setFormData(prev => ({ ...prev, ...changes }));
        Object.assign(pendingUpdates.current, changes);
        debouncedSave();
    };

    const handleInputChange = (field, value) => {
        updateFormData({ [field]: value });
    };

    const handleStatusCycle = (field) => {
        const current = formData[field];
        let nextVal;
        // Cycle: true (Green/Yes) -> false (Red/No) -> 'nr' (Grey/NR) -> true
        if (current === true) nextVal = false;
        else if (current === false) nextVal = 'nr';
        else nextVal = true; // includes 'nr', null, undefined

        updateFormData({ [field]: nextVal });
    };

    const handleAddStaff = () => {
        const newStaffList = [...(formData.sp_mgmt_staffList || []), {
            id: Date.now(),
            name: '',
            designation: '',
            qualification: '',
            currentPostDuration: '',
            teacherDuration: '',
            educationDuration: '',
            certificate: '',
            mobile: ''
        }];
        updateFormData({ sp_mgmt_staffList: newStaffList });
    };

    const handleRemoveStaff = (index) => {
        const newStaffList = (formData.sp_mgmt_staffList || []).filter((_, i) => i !== index);
        updateFormData({ sp_mgmt_staffList: newStaffList });
    };

    const handleStaffChange = (index, field, value) => {
        const newStaffList = (formData.sp_mgmt_staffList || []).map((staff, i) =>
            i === index ? { ...staff, [field]: value } : staff
        );
        updateFormData({ sp_mgmt_staffList: newStaffList });
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        // Auto-scroll to content area after tab click
        setTimeout(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    // Get current tab info
    const currentTab = allSections.find(s => s.id === activeTab);

    const renderInput = (label, labelDv, field, type = 'text', placeholder = '') => (
        <div className="form-field">
            <label>
                {label && <span className="label-en">{label}</span>}
                <span className="label-dv font-dhivehi" dir="rtl">{labelDv}</span>
            </label>
            <input
                type={type}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={placeholder}
                className="form-input"
            />
        </div>
    );





    const handleMatrixInputChange = (field, value) => {
        // Ensure we handle empty strings correctly
        const newValue = value === '' ? '' : parseInt(value);

        // Helper to safely get number from formData or updatedFormData
        // We need to look up in updatedFormData first, then formData
        const getVal = (data, key) => {
            const val = data[key];
            return (val === '' || val === undefined || val === null) ? 0 : (parseInt(val) || 0);
        };

        // Create a copy of formData to apply updates to
        const updatedData = { ...formData, [field]: newValue };

        // 1. Identify which group and row changed
        // Format: sp_tm_[row]_[group]_[subfield]
        // rows: f (female), m (male), t (total)
        // groups: gen (Total Teachers), tr (Trained), un (Untrained)
        const parts = field.split('_');
        if (parts.length >= 5 && parts[1] === 'tm') {
            const row = parts[2]; // f, m
            const group = parts[3]; // gen, tr, un

            // We only trigger calc if change is in 'f' or 'm' rows and NOT a total field itself
            // Although total fields are read-only, we double check.
            if ((row === 'f' || row === 'm') && !field.endsWith('_total')) {

                // 2. Calculate Group Totals for the specific row (Row Total)
                // Untrained Group: SEN + Expat + Local
                if (group === 'un') {
                    updatedData[`sp_tm_${row}_un_total`] = getVal(updatedData, `sp_tm_${row}_un_sen`) + getVal(updatedData, `sp_tm_${row}_un_expat`) + getVal(updatedData, `sp_tm_${row}_un_local`);
                }
                // Trained Group: SEN + Temp + Expat + Local
                else if (group === 'tr') {
                    updatedData[`sp_tm_${row}_tr_total`] = getVal(updatedData, `sp_tm_${row}_tr_sen`) + getVal(updatedData, `sp_tm_${row}_tr_temp`) + getVal(updatedData, `sp_tm_${row}_tr_expat`) + getVal(updatedData, `sp_tm_${row}_tr_local`);
                }
                // General Group: SEN + Expat + Local
                else if (group === 'gen') {
                    updatedData[`sp_tm_${row}_gen_total`] = getVal(updatedData, `sp_tm_${row}_gen_sen`) + getVal(updatedData, `sp_tm_${row}_gen_expat`) + getVal(updatedData, `sp_tm_${row}_gen_local`);
                }
            }

            // 3. Calculate Total Row (Column Totals)
            // Ideally re-calculate ALL totals for the user-modified column and impacted group totals
            // For simplicity and correctness, let's re-calculate the relevant column in the Total Row

            // Subfield is 'sen', 'local', etc.
            const subfieldParts = parts.slice(4);
            const subfield = subfieldParts.join('_');

            // Update Total Row for the specific column changed
            updatedData[`sp_tm_t_${group}_${subfield}`] = getVal(updatedData, `sp_tm_f_${group}_${subfield}`) + getVal(updatedData, `sp_tm_m_${group}_${subfield}`);

            // If we updated the group totals (step 2), we need to update the Total Row's group total as well
            if (!field.endsWith('_total')) {
                updatedData[`sp_tm_t_${group}_total`] = getVal(updatedData, `sp_tm_f_${group}_total`) + getVal(updatedData, `sp_tm_m_${group}_total`);
            }
        }
        // Student Matrix Calculations (sp_s_[row]_[grade])
        else if (parts.length === 4 && parts[1] === 's') {
            const row = parts[2]; // f, m
            const grade = parts[3]; // lkg, ukg, 1..12

            if ((row === 'f' || row === 'm') && grade !== 'total') {
                // 1. Calculate Row Total
                const grades = ['lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
                updatedData[`sp_s_${row}_total`] = grades.reduce((acc, g) => acc + getVal(updatedData, `sp_s_${row}_${g}`), 0);

                // 2. Calculate Column Total (Grade Total)
                updatedData[`sp_s_t_${grade}`] = getVal(updatedData, `sp_s_f_${grade}`) + getVal(updatedData, `sp_s_m_${grade}`);

                // 3. Calculate Grand Total
                updatedData[`sp_s_t_total`] = getVal(updatedData, `sp_s_f_total`) + getVal(updatedData, `sp_s_m_total`);
            }
        }
        // Generic Matrix Calculations for SEN and Literacy
        // format: sp_[prefix]_[row]_[grade]
        // prefixes: sen_s, sen_d, lit_dn, lit_en, lit_dg, lit_eg, lit_mg
        else if (parts.length >= 5 && (parts[1] === 'sen' || parts[1] === 'lit')) {
            const prefix = `${parts[1]}_${parts[2]}`; // e.g. sen_s, lit_dn
            const row = parts[3];
            const grade = parts[4];

            if ((row === 'f' || row === 'm') && grade !== 'total') {
                // Determine grades list based on prefix
                // lit_dn and lit_en exclude foundation
                const isNoFoundation = prefix === 'lit_dn' || prefix === 'lit_en';
                const grades = isNoFoundation
                    ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
                    : ['lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

                // 1. Calculate Row Total
                updatedData[`sp_${prefix}_${row}_total`] = grades.reduce((acc, g) => acc + getVal(updatedData, `sp_${prefix}_${row}_${g}`), 0);

                // 2. Calculate Column Total (Grade Total)
                updatedData[`sp_${prefix}_t_${grade}`] = getVal(updatedData, `sp_${prefix}_f_${grade}`) + getVal(updatedData, `sp_${prefix}_m_${grade}`);

                // 3. Calculate Grand Total
                updatedData[`sp_${prefix}_t_total`] = getVal(updatedData, `sp_${prefix}_f_total`) + getVal(updatedData, `sp_${prefix}_m_total`);
            }
        }
        // O Level / A Level Results Calculations
        // format: sp_ol_[subject]_[grade] or sp_al_[subject]_[grade]
        else if (field.startsWith('sp_ol_') || field.startsWith('sp_al_')) {
            const prefix = field.startsWith('sp_ol_') ? 'sp_ol_' : 'sp_al_';
            // Check it's NOT a trend field (sp_ol_tr_ or sp_al_tr_)
            const isTrend = field.startsWith(`${prefix}tr_`);

            if (isTrend) {
                // Trend table: auto-calculate pass_pct = (pass_count / part) * 100
                // Extract: sp_ol_tr_[year]_[subject]_[metric]
                const trendPrefix = `${prefix}tr_`;
                const afterPrefix = field.slice(trendPrefix.length); // e.g. "2019_islam_pass_count"
                // Find which year and subject this belongs to
                const years = ['2019', '2020', '2021_2022'];
                for (const year of years) {
                    if (afterPrefix.startsWith(`${year}_`)) {
                        const afterYear = afterPrefix.slice(`${year}_`.length); // e.g. "islam_pass_count"
                        // Extract subject id (everything before the last _metric)
                        const lastUnderscore = afterYear.lastIndexOf('_');
                        if (lastUnderscore === -1) break;
                        // Metrics could be: taken, part, pass_count, pass_pct
                        // For pass_count: afterYear = "islam_pass_count" -> subject is before "_pass_count"
                        // For part: afterYear = "islam_part" -> subject is before "_part"
                        let subjectId;
                        if (afterYear.endsWith('_pass_count')) {
                            subjectId = afterYear.slice(0, afterYear.indexOf('_pass_count'));
                        } else if (afterYear.endsWith('_part')) {
                            subjectId = afterYear.slice(0, afterYear.indexOf('_part'));
                        } else if (afterYear.endsWith('_taken')) {
                            subjectId = afterYear.slice(0, afterYear.indexOf('_taken'));
                        } else {
                            break; // pass_pct itself or unknown
                        }
                        // Recalculate pass_pct for this subject/year
                        const partVal = getVal(updatedData, `${trendPrefix}${year}_${subjectId}_part`);
                        const passCount = getVal(updatedData, `${trendPrefix}${year}_${subjectId}_pass_count`);
                        updatedData[`${trendPrefix}${year}_${subjectId}_pass_pct`] = partVal > 0
                            ? Math.round((passCount / partVal) * 1000) / 10
                            : '';
                        break;
                    }
                }
            } else {
                // Main results table: calculate total points and max points per subject
                // Extract subject id from field: sp_ol_[subject]_[grade]
                const afterPrefix = field.slice(prefix.length); // e.g. "islam_astar"
                const subjects = ['islam', 'dhivehi', 'english', 'math', 'chem', 'phys', 'bio', 'marine', 'cs', 'acc', 'bus', 'econ', 'tt', 'hist', 'geo', 'lit', 'art', 'btec'];
                for (const sub of subjects) {
                    if (afterPrefix.startsWith(`${sub}_`)) {
                        // Calculate total points: A*×6 + A×5 + B×4 + C×3 + D×2 + E×1 + U×0
                        const astar = getVal(updatedData, `${prefix}${sub}_astar`);
                        const a = getVal(updatedData, `${prefix}${sub}_a`);
                        const b = getVal(updatedData, `${prefix}${sub}_b`);
                        const c = getVal(updatedData, `${prefix}${sub}_c`);
                        const d = getVal(updatedData, `${prefix}${sub}_d`);
                        const e = getVal(updatedData, `${prefix}${sub}_e`);
                        updatedData[`${prefix}${sub}_total`] = (astar * 6) + (a * 5) + (b * 4) + (c * 3) + (d * 2) + (e * 1);

                        // Calculate max points: participated × 6
                        const partVal = getVal(updatedData, `${prefix}${sub}_part`);
                        updatedData[`${prefix}${sub}_max`] = partVal * 6;

                        // Calculate Grand Totals (Sum of all subjects)
                        let grandTotalPoints = 0;
                        let grandMaxPoints = 0;
                        subjects.forEach(s => {
                            // Use updated value for current subject (s === sub)
                            // Note: We need to use updatedData for the current subject because it's not in formData yet,
                            // but for other subjects we must use updatedData (if they were updated before) or formData.
                            // In this loop, `updatedData` has the LATEST values for the CURRENT subject `sub`.
                            // For other subjects `s`, we should check `updatedData` first (in case multiple updates happened? No, handleMatrixInputChange is for ONE field change).
                            // Wait, `updatedData` is `...formData` + new field value.
                            // However, `updatedData` ALSO has the newly calculated total/max for CURRENT subject `sub` (lines above).
                            // So:
                            // If s === sub, use the values we JUST calculated in updatedData.
                            // If s !== sub, use values from updatedData (which are same as formData unless we modified them previously in this function call - which we haven't for OTHER subjects).

                            const sTotal = getVal(updatedData, `${prefix}${s}_total`);
                            const sMax = getVal(updatedData, `${prefix}${s}_max`);
                            grandTotalPoints += sTotal;
                            grandMaxPoints += sMax;
                        });
                        updatedData[`${prefix}total_points`] = grandTotalPoints;
                        updatedData[`${prefix}max_points`] = grandMaxPoints;
                        break;
                    }
                }
            }
        }
        // School Exam Results Calculations
        // format: sp_se_gr[N]_[subject]_[metric]
        else if (field.startsWith('sp_se_gr')) {
            // Extract grade number
            const gradeMatch = field.match(/sp_se_gr(\d+)_/);
            if (gradeMatch) {
                const grade = gradeMatch[1];
                const grPrefix = `sp_se_gr${grade}_`;
                const afterPrefix = field.slice(grPrefix.length); // e.e.g. "islam_taken"

                // Get subject list for this grade
                let subjectIds;
                if (grade === '7') {
                    subjectIds = ['islam', 'dhivehi', 'english', 'math', 'science', 'bus'];
                } else if (['8', '9', '10'].includes(grade)) {
                    subjectIds = ['islam', 'dhivehi', 'english', 'math', 'chem', 'phys', 'bio', 'marine', 'acc', 'bus', 'econ', 'tt', 'hist', 'geo', 'lit', 'art'];
                } else {
                    subjectIds = ['islam', 'dhivehi', 'english', 'math', 'fmath', 'chem', 'phys', 'bio', 'marine', 'acc', 'bus', 'econ', 'tt', 'psych', 'hist', 'geo', 'lit', 'art'];
                }

                // 1. Calculate pass_pct for the changed subject
                for (const sub of subjectIds) {
                    if (afterPrefix.startsWith(`${sub}_`)) {
                        const taken = getVal(updatedData, `${grPrefix}${sub}_taken`);
                        const passCount = getVal(updatedData, `${grPrefix}${sub}_pass_count`);
                        updatedData[`${grPrefix}${sub}_pass_pct`] = taken > 0
                            ? Math.round((passCount / taken) * 1000) / 10
                            : '';
                        break;
                    }
                }

                // Also handle outcomes row for grade 7
                if (grade === '7' && afterPrefix.startsWith('outcomes_')) {
                    const taken = getVal(updatedData, `${grPrefix}outcomes_taken`);
                    const passCount = getVal(updatedData, `${grPrefix}outcomes_pass_count`);
                    updatedData[`${grPrefix}outcomes_pass_pct`] = taken > 0
                        ? Math.round((passCount / taken) * 1000) / 10
                        : '';
                }

                // 2. Recalculate average row
                let totalTaken = 0, totalPassCount = 0, subjectCount = 0;
                for (const sub of subjectIds) {
                    const t = getVal(updatedData, `${grPrefix}${sub}_taken`);
                    const p = getVal(updatedData, `${grPrefix}${sub}_pass_count`);
                    if (t > 0) {
                        totalTaken += t;
                        totalPassCount += p;
                        subjectCount++;
                    }
                }
                updatedData[`${grPrefix}avg_taken`] = subjectCount > 0 ? Math.round(totalTaken / subjectCount) : '';
                updatedData[`${grPrefix}avg_pass_count`] = subjectCount > 0 ? Math.round(totalPassCount / subjectCount) : '';
                updatedData[`${grPrefix}avg_pass_pct`] = totalTaken > 0
                    ? Math.round((totalPassCount / totalTaken) * 1000) / 10
                    : '';
            }
        }
        const changes = {};
        for (const key in updatedData) {
            if (updatedData[key] !== formData[key]) {
                changes[key] = updatedData[key];
            }
        }
        updateFormData(changes);
    };

    const renderMatrixInput = (field, isReadOnly = false, className = '') => (
        <input
            type="number"
            className={`form-input text-center p-1 h-8 text-sm ${isReadOnly ? 'bg-gray-100' : ''} ${className}`}
            value={formData[field]}
            onChange={(e) => !isReadOnly && handleMatrixInputChange(field, e.target.value)}
            readOnly={isReadOnly}
        />
    );





    const renderResourceTable = (number, titleDv, items) => (
        <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* Header with gradient */}
            <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '40px', textAlign: 'center' }}>{number}</span>
                <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>{titleDv}</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="matrix-grid font-dhivehi w-full text-right" dir="rtl" style={{ fontSize: '17px' }}>
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 border font-bold text-gray-700" style={{ verticalAlign: 'middle' }}>ތަފްޞީލު</th>
                            <th className="p-3 border font-bold text-center w-36 text-gray-700" style={{ verticalAlign: 'middle', background: 'rgba(37,99,235,0.06)' }}>ޙާލަތު</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                <td className="p-3 border font-medium" style={{ verticalAlign: 'middle' }}>{item.label}</td>
                                <td className="p-2 border" style={{ verticalAlign: 'middle', background: 'rgba(37,99,235,0.04)', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} dir="ltr">
                                        {item.type === 'number' ? (
                                            <input
                                                type="number"
                                                value={formData[item.field]}
                                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                className="form-input w-24 text-center font-bold text-blue-700 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                                placeholder="0"
                                            />
                                        ) : (
                                            // 3-State Toggle (icon-only, no box)
                                            <span
                                                onClick={() => handleStatusCycle(item.field)}
                                                style={{
                                                    cursor: 'pointer', userSelect: 'none',
                                                    fontWeight: 800,
                                                    fontSize: formData[item.field] === true || formData[item.field] === false ? '1.3rem' : '0.8rem',
                                                    color: formData[item.field] === true
                                                        ? '#16a34a' : formData[item.field] === false
                                                            ? '#dc2626' : '#9ca3af',
                                                    transition: 'all 0.15s ease',
                                                }}
                                            >
                                                {formData[item.field] === true ? '✓' : formData[item.field] === false ? '✗' : 'NR'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderOLevelResultTable = () => {
        const subjects = [
            { id: 'islam', labelDv: 'އިސްލާމް' },
            { id: 'dhivehi', labelDv: 'ދިވެހި' },
            { id: 'english', labelDv: 'އިނގިރޭސި' },
            { id: 'math', labelDv: 'ހިސާބު' },
            { id: 'chem', labelDv: 'ކެމިސްޓްރީ' },
            { id: 'phys', labelDv: 'ފިޒިކްސް' },
            { id: 'bio', labelDv: 'ބަޔޮލޮޖީ' },
            { id: 'marine', labelDv: 'މެރިން ސައިންސް' },
            { id: 'cs', labelDv: 'ކޮމްޕިއުޓަރ ސައިންސް' },
            { id: 'acc', labelDv: 'އެކައުންޓިން' },
            { id: 'bus', labelDv: 'ބިޒްނަސް ސްޓަޑީޒް' },
            { id: 'econ', labelDv: 'އިކޮނޮމިކްސް' },
            { id: 'tt', labelDv: 'ޓްރެވަލް އެންޑް ޓުވަރިޒަމް' },
            { id: 'hist', labelDv: 'ހިިސްޓްރީ' },
            { id: 'geo', labelDv: 'ޖޯގްރަފީ' },
            { id: 'lit', labelDv: 'ލިޓްރޭޗަރ' },
            { id: 'art', labelDv: 'އާރޓް އެންޑް ޑިޒައިން' },
            { id: 'btec', labelDv: 'ބީޓެކް' }
        ];

        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Header with gradient */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="rtl">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 14px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)' }}>1</span>
                        <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>އެސްއެސްސީ އާއި އޯލެވެލް އިމްތިޙާނުގެ ނަތީޖާ</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }} dir="ltr">
                        {['A*=6', 'A=5', 'B=4', 'C=3', 'D=2', 'E=1', 'U=0'].map((g, i) => (
                            <span key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{g}</span>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi text-center" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th rowSpan="2" className="p-2 border text-right font-bold">މާއްދާ</th>
                                <th rowSpan="2" className="p-2 border font-bold w-24">މާއްދާ ކިޔެވި ދަރިވަރުންގެ އަދަދު</th>
                                <th rowSpan="2" className="p-2 border font-bold w-24">އިމްތިޙާނުގައި ބައިވެރިވި ދަރިވަރުންގެ އަދަދު</th>
                                <th colSpan="7" className="p-2 border font-bold bg-gray-50">އެސްއެސްސީ އާއި އޯލެވެލް އިމްތިޙާނުގެ ނަތީޖާ</th>
                                <th rowSpan="2" className="p-2 border font-bold w-16" style={{ background: 'rgba(37,99,235,0.08)' }}>ޖުމްލަ</th>
                                <th rowSpan="2" className="p-2 border font-bold w-20" style={{ background: 'rgba(37,99,235,0.08)' }}>ހާސިލުކުރެވޭނެ އެންމެ މަތީ ޕޮއިންޓް</th>
                            </tr>
                            <tr className="bg-gray-100">
                                <th className="p-1 border w-10 font-bold">A*</th>
                                <th className="p-1 border w-10 font-bold">A</th>
                                <th className="p-1 border w-10 font-bold">B</th>
                                <th className="p-1 border w-10 font-bold">C</th>
                                <th className="p-1 border w-10 font-bold">D</th>
                                <th className="p-1 border w-10 font-bold">E</th>
                                <th className="p-1 border w-10 font-bold">U</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((sub, idx) => (
                                <tr key={sub.id} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-2 border text-right font-semibold">{sub.labelDv}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_part`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_astar`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_a`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_b`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_c`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_d`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_e`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_${sub.id}_u`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.08)' }}>
                                        <input
                                            type="text"
                                            value={formData[`sp_ol_${sub.id}_total`] || 0}
                                            readOnly
                                            className={`form-input w-full bg-transparent font-bold text-center ${(parseFloat(formData[`sp_ol_${sub.id}_total`] || 0) < (parseFloat(formData[`sp_ol_${sub.id}_max`] || 0) * 0.5)) ? 'text-red-600' : ''
                                                }`}
                                        />
                                    </td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.08)' }}>{renderMatrixInput(`sp_ol_${sub.id}_max`, true, 'bg-transparent')}</td>
                                </tr>
                            ))}
                            {/* Summary Row - gradient */}
                            <tr style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
                                <td style={{ padding: '10px 14px', border: '1px solid #1e3a5f', textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>ޖުމްލަ</td>
                                <td colSpan="2" style={{ border: '1px solid #1e3a5f', background: 'rgba(0,0,0,0.1)' }}></td>
                                <td colSpan="7" style={{ border: '1px solid #1e3a5f', background: 'rgba(0,0,0,0.1)' }}></td>
                                <td style={{ padding: '6px', border: '1px solid #1e3a5f', background: 'rgba(255,255,255,0.1)' }}>
                                    <input
                                        type="text"
                                        value={formData['sp_ol_total_points'] || 0}
                                        readOnly
                                        className={`form-input w-full bg-transparent font-bold text-center ${(parseFloat(formData['sp_ol_total_points'] || 0) < (parseFloat(formData['sp_ol_max_points'] || 0) * 0.5)) ? 'text-red-600' : ''}`}
                                        style={{ color: '#fff' }}
                                    />
                                </td>
                                <td style={{ padding: '6px', border: '1px solid #1e3a5f', background: 'rgba(255,255,255,0.1)' }}>{renderMatrixInput('sp_ol_max_points', true, 'bg-transparent font-bold text-white')}</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td colSpan="3" className="p-3 border text-right font-bold">އެސްއެސްސީ އާއި އޯލެވެލް އިމްތިޙާނުން ފަސް މާއްދާއިން ފާސްވި ދަރިވަރުންގެ އިންސައްތަ :</td>
                                <td colSpan="9" className="p-1 border text-right">
                                    <div className="flex items-center justify-end gap-2 pr-4">
                                        {renderMatrixInput('sp_ol_5_subject_pass_pct', false, 'w-24 text-center font-bold')}
                                        <span className="font-bold">%</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderOLevelTrendTable = () => {
        const subjects = [
            { id: 'islam', labelDv: 'އިސްލާމް' },
            { id: 'dhivehi', labelDv: 'ދިވެހި' },
            { id: 'math', labelDv: 'ހިސާބު' },
            { id: 'english', labelDv: 'އިނގިރޭސި' },
            { id: 'acc', labelDv: 'އެކައުންޓް' },
            { id: 'bus', labelDv: 'ބިޒްނަސް' },
            { id: 'econ', labelDv: 'އިކޮނޯމިކްސް' },
            { id: 'phys', labelDv: 'ފިޒިކްސް' },
            { id: 'chem', labelDv: 'ކެމިސްޓްރީ' },
            { id: 'bio', labelDv: 'ބައޮލޮޖީ' },
            { id: 'tt', labelDv: 'ޓީ.ޓީ' },
            { id: 'cs', labelDv: 'ކޮމްޕިއުޓަރ ސައިންސް' },
            { id: 'art', labelDv: 'އާރޓް' },
            { id: 'btec', labelDv: 'ބީޓެކް' },
        ];

        return (
            <div className="resource-section-card full-width mt-8" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Header with gradient */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }} dir="rtl">
                    <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 14px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)' }}>2</span>
                    <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>ވޭތުވެ ދިޔަ 3 އަހަރުގެ އޯލެވެލްއާއި އެސްއެސްސީގެ ނަތީޖާތައް</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi text-center" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th rowSpan="2" className="p-2 border text-right font-bold">މާއްދާ</th>
                                <th colSpan="4" className="p-2 border font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>2019</th>
                                <th colSpan="4" className="p-2 border font-bold" style={{ background: 'rgba(37,99,235,0.12)' }}>2020</th>
                                <th colSpan="4" className="p-2 border font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>2021-2022</th>
                            </tr>
                            <tr className="bg-gray-100">
                                {/* 2019 */}
                                <th className="p-1 border w-20 font-bold">ގްރޭޑް 10 ކިޔެވި</th>
                                <th className="p-1 border w-16 font-bold">ބައިވެރިވި</th>
                                <th className="p-1 border w-16 font-bold">ފާސްވި</th>
                                <th className="p-1 border w-16 font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>%</th>
                                {/* 2020 */}
                                <th className="p-1 border w-20 font-bold">ގްރޭޑް 10 ކިޔެވި</th>
                                <th className="p-1 border w-16 font-bold">ބައިވެރިވި</th>
                                <th className="p-1 border w-16 font-bold">ފާސްވި</th>
                                <th className="p-1 border w-16 font-bold" style={{ background: 'rgba(37,99,235,0.12)' }}>%</th>
                                {/* 2021-2022 */}
                                <th className="p-1 border w-20 font-bold">ގްރޭޑް 10 ކިޔެވި</th>
                                <th className="p-1 border w-16 font-bold">ބައިވެރިވި</th>
                                <th className="p-1 border w-16 font-bold">ފާސްވި</th>
                                <th className="p-1 border w-16 font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((sub, idx) => (
                                <tr key={sub.id} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-2 border text-right font-semibold">{sub.labelDv}</td>
                                    {/* 2019 */}
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2019_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2019_${sub.id}_part`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2019_${sub.id}_pass_count`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.06)' }}>{renderMatrixInput(`sp_ol_tr_2019_${sub.id}_pass_pct`, true, 'bg-transparent')}</td>
                                    {/* 2020 */}
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2020_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2020_${sub.id}_part`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2020_${sub.id}_pass_count`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.06)' }}>{renderMatrixInput(`sp_ol_tr_2020_${sub.id}_pass_pct`, true, 'bg-transparent')}</td>
                                    {/* 2021-2022 */}
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2021_2022_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2021_2022_${sub.id}_part`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_ol_tr_2021_2022_${sub.id}_pass_count`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.06)' }}>{renderMatrixInput(`sp_ol_tr_2021_2022_${sub.id}_pass_pct`, true, 'bg-transparent')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };


    const renderALevelResultTable = () => {
        const subjects = [
            { id: 'islam', labelDv: 'އިސްލާމް' },
            { id: 'dhivehi', labelDv: 'ދިވެހި' },
            { id: 'english', labelDv: 'އިނގިރޭސި' },
            { id: 'math', labelDv: 'ހިސާބު' },
            { id: 'chem', labelDv: 'ކެމިސްޓްރީ' },
            { id: 'phys', labelDv: 'ފިޒިކްސް' },
            { id: 'bio', labelDv: 'ބަޔޮލޮޖީ' },
            { id: 'marine', labelDv: 'މެރިން ސައިންސް' },
            { id: 'cs', labelDv: 'ކޮމްޕިއުޓަރ ސައިންސް' },
            { id: 'acc', labelDv: 'އެކައުންޓިން' },
            { id: 'bus', labelDv: 'ބިޒްނަސް ސްޓަޑީޒް' },
            { id: 'econ', labelDv: 'އިކޮނޮމިކްސް' },
            { id: 'tt', labelDv: 'ޓްރެވަލް އެންޑް ޓުވަރިޒަމް' },
            { id: 'hist', labelDv: 'ހިިސްޓްރީ' },
            { id: 'geo', labelDv: 'ޖޯގްރަފީ' },
            { id: 'lit', labelDv: 'ލިޓްރޭޗަރ' },
            { id: 'art', labelDv: 'އާރޓް އެންޑް ޑިޒައިން' },
        ];

        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Header with gradient */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="rtl">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 14px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)' }}>3</span>
                        <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>އެޗްއެސްސީ އާއި އޭލެވެލް އިމްތިޙާނުގެ ނަތީޖާ</h3>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }} dir="ltr">
                        {['A*=6', 'A=5', 'B=4', 'C=3', 'D=2', 'E=1', 'U=0'].map((g, i) => (
                            <span key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '6px', padding: '2px 8px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{g}</span>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi text-center" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th rowSpan="2" className="p-2 border text-right font-bold">މާއްދާ</th>
                                <th rowSpan="2" className="p-2 border font-bold w-24">މާއްދާ ކިޔެވި ދަރިވަރުންގެ އަދަދު</th>
                                <th rowSpan="2" className="p-2 border font-bold w-24">އިމްތިޙާނުގައި ބައިވެރިވި ދަރިވަރުންގެ އަދަދު</th>
                                <th colSpan="7" className="p-2 border font-bold bg-gray-50">އެޗްއެސްސީ އާއި އޭލެވެލް އިމްތިޙާނުގެ ނަތީޖާ</th>
                                <th rowSpan="2" className="p-2 border font-bold w-16" style={{ background: 'rgba(37,99,235,0.08)' }}>ޖުމްލަ</th>
                                <th rowSpan="2" className="p-2 border font-bold w-20" style={{ background: 'rgba(37,99,235,0.08)' }}>ހާސިލުކުރެވޭނެ އެންމެ މަތީ ޕޮއިންޓް</th>
                            </tr>
                            <tr className="bg-gray-100">
                                <th className="p-1 border w-10 font-bold">A*</th>
                                <th className="p-1 border w-10 font-bold">A</th>
                                <th className="p-1 border w-10 font-bold">B</th>
                                <th className="p-1 border w-10 font-bold">C</th>
                                <th className="p-1 border w-10 font-bold">D</th>
                                <th className="p-1 border w-10 font-bold">E</th>
                                <th className="p-1 border w-10 font-bold">U</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((sub, idx) => (
                                <tr key={sub.id} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-2 border text-right font-semibold">{sub.labelDv}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_part`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_astar`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_a`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_b`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_c`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_d`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_e`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_${sub.id}_u`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.08)' }}>
                                        <input
                                            type="text"
                                            value={formData[`sp_al_${sub.id}_total`] || 0}
                                            readOnly
                                            className={`form-input w-full bg-transparent font-bold text-center ${(parseFloat(formData[`sp_al_${sub.id}_total`] || 0) < (parseFloat(formData[`sp_al_${sub.id}_max`] || 0) * 0.5)) ? 'text-red-600' : ''
                                                }`}
                                        />
                                    </td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.08)' }}>{renderMatrixInput(`sp_al_${sub.id}_max`, true, 'bg-transparent')}</td>
                                </tr>
                            ))}
                            {/* Summary Row - gradient */}
                            <tr style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
                                <td style={{ padding: '10px 14px', border: '1px solid #1e3a5f', textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>ޖުމްލަ</td>
                                <td colSpan="2" style={{ border: '1px solid #1e3a5f', background: 'rgba(0,0,0,0.1)' }}></td>
                                <td colSpan="7" style={{ border: '1px solid #1e3a5f', background: 'rgba(0,0,0,0.1)' }}></td>
                                <td style={{ padding: '6px', border: '1px solid #1e3a5f', background: 'rgba(255,255,255,0.1)' }}>
                                    <input
                                        type="text"
                                        value={formData['sp_al_total_points'] || 0}
                                        readOnly
                                        className={`form-input w-full bg-transparent font-bold text-center ${(parseFloat(formData['sp_al_total_points'] || 0) < (parseFloat(formData['sp_al_max_points'] || 0) * 0.5)) ? 'text-red-600' : ''}`}
                                        style={{ color: '#fff' }}
                                    />
                                </td>
                                <td style={{ padding: '6px', border: '1px solid #1e3a5f', background: 'rgba(255,255,255,0.1)' }}>{renderMatrixInput('sp_al_max_points', true, 'bg-transparent font-bold text-white')}</td>
                            </tr>
                            <tr className="bg-gray-50">
                                <td colSpan="3" className="p-3 border text-right font-bold">އެޗްއެސްސީ އާއި އޭލެވެލް އިމްތިޙާނުން ފަސް މާއްދާއިން ފާސްވި ދަރިވަރުންގެ އިންސައްތަ :</td>
                                <td colSpan="9" className="p-1 border text-right">
                                    <div className="flex items-center justify-end gap-2 pr-4">
                                        {renderMatrixInput('sp_al_5_subject_pass_pct', false, 'w-24 text-center font-bold')}
                                        <span className="font-bold">%</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderALevelTrendTable = () => {
        const subjects = [
            { id: 'islam', labelDv: 'އިސްލާމް' },
            { id: 'dhivehi', labelDv: 'ދިވެހި' },
            { id: 'math', labelDv: 'ހިސާބު' },
            { id: 'english', labelDv: 'އިނގިރޭސި' },
            { id: 'acc', labelDv: 'އެކައުންޓް' },
            { id: 'bus', labelDv: 'ބިޒްނަސް' },
            { id: 'econ', labelDv: 'އިކޮނޯމިކްސް' },
            { id: 'phys', labelDv: 'ފިޒިކްސް' },
            { id: 'chem', labelDv: 'ކެމިސްޓްރީ' },
            { id: 'bio', labelDv: 'ބައޮލޮޖީ' },
            { id: 'tt', labelDv: 'ޓީ.ޓީ' },
            { id: 'cs', labelDv: 'ކޮމްޕިއުޓަރ ސައިންސް' },
            { id: 'art', labelDv: 'އާރޓް' },
            { id: 'btec', labelDv: 'ބީޓެކް' },
        ];

        return (
            <div className="resource-section-card full-width mt-8" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Header with gradient */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }} dir="rtl">
                    <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 14px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)' }}>4</span>
                    <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>ވޭތުވެ ދިޔަ 3 އަހަރުގެ އޭލެވެލްއާއި އެޗްއެސްސީގެ ނަތީޖާތައް</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi text-center" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th rowSpan="2" className="p-2 border text-right font-bold">މާއްދާ</th>
                                <th colSpan="4" className="p-2 border font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>2019</th>
                                <th colSpan="4" className="p-2 border font-bold" style={{ background: 'rgba(37,99,235,0.12)' }}>2020</th>
                                <th colSpan="4" className="p-2 border font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>2021-2022</th>
                            </tr>
                            <tr className="bg-gray-100">
                                {/* 2019 */}
                                <th className="p-1 border w-20 font-bold">ގްރޭޑް 12 ކިޔެވި</th>
                                <th className="p-1 border w-16 font-bold">ބައިވެރިވި</th>
                                <th className="p-1 border w-16 font-bold">ފާސްވި</th>
                                <th className="p-1 border w-16 font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>%</th>
                                {/* 2020 */}
                                <th className="p-1 border w-20 font-bold">ގްރޭޑް 12 ކިޔެވި</th>
                                <th className="p-1 border w-16 font-bold">ބައިވެރިވި</th>
                                <th className="p-1 border w-16 font-bold">ފާސްވި</th>
                                <th className="p-1 border w-16 font-bold" style={{ background: 'rgba(37,99,235,0.12)' }}>%</th>
                                {/* 2021-2022 */}
                                <th className="p-1 border w-20 font-bold">ގްރޭޑް 12 ކިޔެވި</th>
                                <th className="p-1 border w-16 font-bold">ބައިވެރިވި</th>
                                <th className="p-1 border w-16 font-bold">ފާސްވި</th>
                                <th className="p-1 border w-16 font-bold" style={{ background: 'rgba(37,99,235,0.08)' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((sub, idx) => (
                                <tr key={sub.id} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-2 border text-right font-semibold">{sub.labelDv}</td>
                                    {/* 2019 */}
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2019_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2019_${sub.id}_part`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2019_${sub.id}_pass_count`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.06)' }}>{renderMatrixInput(`sp_al_tr_2019_${sub.id}_pass_pct`, true, 'bg-transparent')}</td>
                                    {/* 2020 */}
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2020_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2020_${sub.id}_part`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2020_${sub.id}_pass_count`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.06)' }}>{renderMatrixInput(`sp_al_tr_2020_${sub.id}_pass_pct`, true, 'bg-transparent')}</td>
                                    {/* 2021-2022 */}
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2021_2022_${sub.id}_taken`)}</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_al_tr_2021_2022_${sub.id}_part`)}</td>
                                    <td className="p-1 border" style={{ background: 'rgba(37,99,235,0.06)' }}>{renderMatrixInput(`sp_al_tr_2021_2022_${sub.id}_pass_pct`, true, 'bg-transparent')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };


    const renderBasicInfoTable = () => {
        const infoItems = [
            { label: 'އަތޮޅާއި ރަށް', field: 'sp_atollIsland', type: 'text' },
            { label: 'ސްކޫލުގެ ނަން', field: 'sp_schoolName', type: 'text' },
            { label: 'ފޯނު ނަންބަރު', field: 'sp_phone', type: 'tel' },
            { label: 'ހުޅުވުނު ތާރީޚު', field: 'sp_openedDate', type: 'text' },
            { label: 'ކިޔަވައިދޭ ސްޓޭޖްތައް', field: 'sp_stages', type: 'text' },
            { label: 'އީމެއިލް', field: 'sp_email', type: 'email' },
            { label: 'ސެޝަން', field: 'sp_session', type: 'text' },
            { label: 'ދަންފަޅީގެ އަދަދު', field: 'sp_sessionCount', type: 'number' },
            {
                label: 'ހެނދުނު ދަންފަޅި',
                render: () => (
                    <div className="flex items-center gap-4 justify-end">
                        {formData.sp_hasMorningSession && (
                            <input
                                type="text"
                                placeholder="Time"
                                className="form-input w-32 text-right font-bold border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                value={formData.sp_morningSessionTime || ''}
                                onChange={e => handleInputChange('sp_morningSessionTime', e.target.value)}
                            />
                        )}
                        <span
                            onClick={() => handleInputChange('sp_hasMorningSession', !formData.sp_hasMorningSession)}
                            style={{
                                cursor: 'pointer', userSelect: 'none', fontWeight: 800, fontSize: '1.3rem',
                                color: formData.sp_hasMorningSession ? '#16a34a' : '#dc2626',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {formData.sp_hasMorningSession ? '✓' : '✗'}
                        </span>
                    </div>
                )
            },
            {
                label: 'މެންދުރު ދަންފަޅި',
                render: () => (
                    <div className="flex items-center gap-4 justify-end">
                        {formData.sp_hasAfternoonSession && (
                            <input
                                type="text"
                                placeholder="Time"
                                className="form-input w-32 text-right font-bold border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                value={formData.sp_afternoonSessionTime || ''}
                                onChange={e => handleInputChange('sp_afternoonSessionTime', e.target.value)}
                            />
                        )}
                        <span
                            onClick={() => handleInputChange('sp_hasAfternoonSession', !formData.sp_hasAfternoonSession)}
                            style={{
                                cursor: 'pointer', userSelect: 'none', fontWeight: 800, fontSize: '1.3rem',
                                color: formData.sp_hasAfternoonSession ? '#16a34a' : '#dc2626',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {formData.sp_hasAfternoonSession ? '✓' : '✗'}
                        </span>
                    </div>
                )
            },
        ];

        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg, #0f2945 0%, #1e3a5f 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                    <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '28px', textAlign: 'center' }}>1</span>
                    <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>ސްކޫލުގެ މަޢުލޫމާތު</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi w-full text-right" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border font-bold text-gray-700 w-1/3" style={{ verticalAlign: 'middle' }}>މަޢުލޫމާތު</th>
                                <th className="p-3 border font-bold text-gray-700" style={{ verticalAlign: 'middle' }}>ތަފްޞީލު</th>
                            </tr>
                        </thead>
                        <tbody>
                            {infoItems.map((item, idx) => (
                                <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-3 border font-medium" style={{ verticalAlign: 'middle' }}>{item.label}</td>
                                    <td className="p-2 border" style={{ verticalAlign: 'middle' }}>
                                        {item.render ? item.render() : (
                                            <input
                                                type={item.type}
                                                value={formData[item.field] || ''}
                                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                className="form-input w-full text-right font-bold border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                                placeholder=""
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderManagementSummaryTable = () => {
        const items = [
            {
                label: 'އެޑްމިނިސްޓްރޭޓަރުގެ މަޤާމު ރިކުއަރމެންޓުގައި ވޭ',
                render: () => (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span
                            onClick={() => handleInputChange('sp_mgmt_hasAdminReq', !formData.sp_mgmt_hasAdminReq)}
                            style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 800, fontSize: '1.3rem', color: formData.sp_mgmt_hasAdminReq ? '#16a34a' : '#dc2626', transition: 'all 0.15s ease' }}
                        >
                            {formData.sp_mgmt_hasAdminReq ? '✓' : '✗'}
                        </span>
                    </div>
                )
            },
            {
                label: 'ޑެޕިއުޓީ ޕްރިންސިޕަލުގެ މަޤާމު ރިކުއަރމެންޓުގައި ވޭ',
                render: () => (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span
                            onClick={() => handleInputChange('sp_mgmt_hasDeputyPrincipalReq', !formData.sp_mgmt_hasDeputyPrincipalReq)}
                            style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 800, fontSize: '1.3rem', color: formData.sp_mgmt_hasDeputyPrincipalReq ? '#16a34a' : '#dc2626', transition: 'all 0.15s ease' }}
                        >
                            {formData.sp_mgmt_hasDeputyPrincipalReq ? '✓' : '✗'}
                        </span>
                    </div>
                )
            },
            { label: 'ލީޑިން ޓީޗަރުން ތިބެންޖެހޭ އަދަދު', field: 'sp_mgmt_leadingTeacherReqCount', type: 'number' },
            { label: 'ލީޑިން ޓީޗަރުން ތިބި އަދަދު', field: 'sp_mgmt_leadingTeacherCount', type: 'number' },
            { label: 'ރިކުއަރމެންޓުގައި ވާ ޑެޕިއުޓީ ޕްރިންސިޕަލުންގެ އަދަދު', field: 'sp_mgmt_deputyPrincipalReqCount', type: 'number' },
        ];

        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                    <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '28px', textAlign: 'center' }}>1</span>
                    <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>މެނޭޖްމަންޓް މަޢުލޫމާތު</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi w-full text-right" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border font-bold text-gray-700 w-1/2" style={{ verticalAlign: 'middle' }}>މަޢުލޫމާތު</th>
                                <th className="p-3 border font-bold text-center text-gray-700" style={{ verticalAlign: 'middle' }}>ތަފްޞީލު</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-3 border font-medium" style={{ verticalAlign: 'middle' }}>{item.label}</td>
                                    <td className="p-2 border text-center" style={{ verticalAlign: 'middle' }}>
                                        {item.render ? item.render() : (
                                            <input
                                                type={item.type}
                                                value={formData[item.field] || ''}
                                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                className="form-input w-24 text-center font-bold text-blue-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                                style={{ margin: '0 auto', display: 'block' }}
                                                placeholder="0"
                                            />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderStaffTable = () => {
        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} dir="rtl">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '28px', textAlign: 'center' }}>2</span>
                        <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>އިސްވެރިންގެ މަޢުލޫމާތު</h3>
                    </div>
                    <button
                        onClick={handleAddStaff}
                        style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s' }}
                    >
                        + Add Staff
                    </button>
                </div>

                <div ref={staffListParentRef} className="matrix-scroll-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table className="matrix-grid font-dhivehi text-center text-xs w-full" dir="rtl" style={{ fontSize: '0.8rem', tableLayout: 'fixed' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr className="bg-gray-100">
                                <th className="p-2 border font-bold text-gray-700 w-32" style={{ verticalAlign: 'middle' }}>ނަން</th>
                                <th className="p-2 border font-bold text-gray-700 w-24" style={{ verticalAlign: 'middle' }}>މަޤާމް</th>
                                <th className="p-2 border font-bold text-gray-700 w-24" style={{ verticalAlign: 'middle' }}>ތަޢުލީމީ ފެންވަރު</th>
                                <th className="p-2 border font-bold text-gray-700 w-20" style={{ verticalAlign: 'middle' }}>މިހާރު ހުރި މަޤާމުގައި</th>
                                <th className="p-2 border font-bold text-gray-700 w-20" style={{ verticalAlign: 'middle' }}>ޓީޗަރެއްގެ ގޮތުގައި</th>
                                <th className="p-2 border font-bold text-gray-700 w-20" style={{ verticalAlign: 'middle' }}>ތަޢުލީމީ ދާއިރާގައި</th>
                                <th className="p-2 border font-bold text-gray-700 w-24" style={{ verticalAlign: 'middle' }}>ސާޓިފިކެޓް</th>
                                <th className="p-2 border font-bold text-gray-700 w-24" style={{ verticalAlign: 'middle' }}>މޮބައިލް</th>
                                <th className="p-2 border font-bold text-gray-700 w-10" style={{ verticalAlign: 'middle' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            <VirtualStaffList
                                staffList={formData.sp_mgmt_staffList || []}
                                handleStaffChange={handleStaffChange}
                                handleRemoveStaff={handleRemoveStaff}
                                parentRef={staffListParentRef}
                            />
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderContactTable = () => {
        const contactItems = [
            { label: 'ފޯނު ނަންބަރު', field: 'phone', type: 'tel', placeholder: '+960 xxx xxxx' },
            { label: 'ފެކްސް ނަންބަރު', field: 'fax', type: 'tel', placeholder: '+960 xxx xxxx' },
            { label: 'އީމެއިލް', field: 'email', type: 'email', placeholder: 'school@email.com' },
            { label: 'ވެބްސައިޓް', field: 'website', type: 'url', placeholder: 'https://' },
            { label: 'ޕްރިންސިޕަލް ފޯނު', field: 'principalPhone', type: 'tel', placeholder: '+960 xxx xxxx' },
            { label: 'އެމަޖެންސީ ނަންބަރު', field: 'emergencyContact', type: 'tel', placeholder: '+960 xxx xxxx' },
        ];

        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg, #0f2945 0%, #1e3a5f 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                    <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '28px', textAlign: 'center' }}>1</span>
                    <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>ގުޅޭނެ މަޢުލޫމާތު</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi w-full text-right" dir="rtl" style={{ fontSize: '0.9rem' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border font-bold text-gray-700 w-1/3" style={{ verticalAlign: 'middle' }}>މަޢުލޫމާތު</th>
                                <th className="p-3 border font-bold text-gray-700" style={{ verticalAlign: 'middle' }}>ތަފްޞީލު</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contactItems.map((item, idx) => (
                                <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-3 border font-medium" style={{ verticalAlign: 'middle' }}>{item.label}</td>
                                    <td className="p-2 border" style={{ verticalAlign: 'middle' }}>
                                        <input
                                            type={item.type}
                                            value={formData[item.field] || ''}
                                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                                            className="form-input w-full text-right font-bold border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                            placeholder={item.placeholder}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAdministrationTable = () => {
        const adminItems = [
            { label: 'ޕްރިންސިޕަލް ނަން', field: 'principalName', type: 'text', placeholder: 'Full name' },
            { label: 'ޕްރިންސިޕަލް ނަން (ދިވެހި)', field: 'principalNameDv', type: 'text', placeholder: 'ފުރިހަމަ ނަން' },
            { label: 'ޑެޕިއުޓީ ޕްރިންސިޕަލް', field: 'deputyPrincipalName', type: 'text', placeholder: 'Full name' },
            { label: 'އެޑްމިން އޮފިސަރ', field: 'adminOfficerName', type: 'text', placeholder: 'Full name' },
            { label: 'ލީޑިން ޓީޗަރު', field: 'leadingTeacherName', type: 'text', placeholder: 'Full name' },
            { label: 'ސްކޫލް ބޯޑް ޗެއަރ', field: 'schoolBoardChairName', type: 'text', placeholder: 'Full name' },
            { label: 'ސްކޫލް ބޯޑް ޗެއަރ (ދިވެހި)', field: 'schoolBoardChairNameDv', type: 'text', placeholder: 'ފުރިހަމަ ނަން' },
            { label: 'ޕީޓީއޭ ނައިބު', field: 'ptaVicePresidentName', type: 'text', placeholder: 'Full name' },
            { label: 'ޕީޓީއޭ ނައިބު (ދިވެހި)', field: 'ptaVicePresidentNameDv', type: 'text', placeholder: 'ފުރިހަމަ ނަން' },
        ];

        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                {/* Header with gradient */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                    <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '28px', textAlign: 'center' }}>1</span>
                    <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>އިދާރީ މަޢުލޫމާތު</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi w-full text-right" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border font-bold text-gray-700 w-1/3" style={{ verticalAlign: 'middle' }}>މަޢުލޫމާތު</th>
                                <th className="p-3 border font-bold text-gray-700" style={{ verticalAlign: 'middle' }}>ތަފްޞީލު</th>
                            </tr>
                        </thead>
                        <tbody>
                            {adminItems.map((item, idx) => (
                                <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-3 border font-medium" style={{ verticalAlign: 'middle' }}>{item.label}</td>
                                    <td className="p-2 border" style={{ verticalAlign: 'middle' }}>
                                        <input
                                            type={item.type}
                                            value={formData[item.field] || ''}
                                            onChange={(e) => handleInputChange(item.field, e.target.value)}
                                            className="form-input w-full text-right font-bold border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                            placeholder={item.placeholder}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderAdminStaffCountsTable = () => {
        const staffItems = [
            { label: 'އިދާރީ މުވައްޒަފުން', actual: 'sp_st_admin_actual', req: 'sp_st_admin_req' },
            { label: 'ސަޕޯޓް ސްޓާފުން', actual: 'sp_st_support_actual', req: 'sp_st_support_req' },
            { label: 'ކައުުންސެލަރުން', actual: 'sp_st_counselors_actual', req: 'sp_st_counselors_req' },
            { label: 'ހެލްތު އެސިސްޓެންޓުން', actual: 'sp_st_health_actual', req: 'sp_st_health_req' },
            { label: 'ލައިބްރޭރިއަނުން', actual: 'sp_st_librarians_actual', req: 'sp_st_librarians_req' },
            { label: 'ލެބް އެސިސްޓެންޓުން', actual: 'sp_st_lab_actual', req: 'sp_st_lab_req' },
            { label: 'ސްޕޯޓް ސްޕަވައިޒަރުން', actual: 'sp_st_sports_actual', req: 'sp_st_sports_req' },
        ];

        return (
            <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Header with gradient */}
                <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                    <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '28px', textAlign: 'center' }}>2</span>
                    <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', margin: 0, lineHeight: 1.4 }}>އިދާރީ އަދި ޓެކްނިކަލް މުވައްޒަފުން</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="matrix-grid font-dhivehi w-full text-right" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 border font-bold text-gray-700 w-1/3" style={{ verticalAlign: 'middle' }}>މަޤާމް</th>
                                <th className="p-3 border font-bold text-center text-gray-700 w-1/3" style={{ verticalAlign: 'middle' }}>ތިބި އަދަދު</th>
                                <th className="p-3 border font-bold text-center text-gray-700 w-1/3" style={{ verticalAlign: 'middle' }}>ތިބެންޖެހޭ އަދަދު</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffItems.map((item, idx) => (
                                <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                    <td className="p-3 border font-medium" style={{ verticalAlign: 'middle' }}>{item.label}</td>
                                    <td className="p-2 border text-center" style={{ verticalAlign: 'middle' }}>
                                        <input
                                            type="number"
                                            value={formData[item.actual] || ''}
                                            onChange={(e) => handleInputChange(item.actual, e.target.value)}
                                            className="form-input w-24 text-center font-bold text-blue-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                            style={{ margin: '0 auto', display: 'block' }}
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="p-2 border text-center" style={{ verticalAlign: 'middle' }}>
                                        <input
                                            type="number"
                                            value={formData[item.req] || ''}
                                            onChange={(e) => handleInputChange(item.req, e.target.value)}
                                            className="form-input w-24 text-center font-bold text-blue-700 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                                            style={{ margin: '0 auto', display: 'block' }}
                                            placeholder="0"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTeacherMainTable = () => {
        const mainItems = [
            { label: 'ސްކޫލުގައި ތިބި މުދައްރިސުން އަދަދު', actual: 'sp_t_total_actual', req: 'sp_t_total_req', reqLabel: 'ސްކޫލުގައި މުދައްރިސުން ތިބެންޖެހޭ އަދަދު' },
            { label: 'ސެން މުދައްރިސުން ތިބި އަދަދު', actual: 'sp_t_sen_actual', req: 'sp_t_sen_req', reqLabel: 'ދަރިވަރުންގެ ނިސްބަތުން ސެން މުދައްރިސުން ތިބެންޖެހޭ އަދަދު' },
            { label: 'ފައުންޑޭޝަން ސްޓޭޖުގެ މުދައްރިސުން ތިބި އަދަދު', actual: 'sp_t_foundation_actual', req: 'sp_t_foundation_req', reqLabel: 'ދަރިވަރުންގެ ނިސްބަތުން ފައުންޑޭޝަން ސްޓޭޖުގެ މުދައްރިސުން ތިބެންޖެހޭ އަދަދު' },
            { label: 'ގުރޭޑު 8 އިން ދަށުގެ ގުރޭޑުތަކަށް މުދައްރިސުން ތިބި އަދަދު', actual: 'sp_t_under8_actual', req: 'sp_t_under8_req', reqLabel: 'ގުރޭޑު 8 އިން ދަށުގެ ގުރޭޑުތަކަށް މުދައްރިސުން ތިބެންޖެހޭ އަދަދު' },
            { label: 'ގުރޭޑު 8 އިން މަތީގެ ގުރޭޑުތަކަށް މުދައްރިސުން ތިބި އަދަދު', actual: 'sp_t_above8_actual', req: 'sp_t_above8_req', reqLabel: 'ގުރޭޑު 8 އިން މަތީގެ ގުރޭޑުތަކަށް މުދައްރިސުން ތިބެންޖެހޭ އަދަދު' },
        ];

        return (
            <div className="resource-section-card full-width mb-8">
                <table className="resource-table font-dhivehi" dir="rtl">
                    <thead>
                        <tr>
                            <th colSpan="3" className="resource-section-title">
                                މުދައްރިސުންގެ ރިކުއަރމެންޓް އަދި އަދަދު
                            </th>
                        </tr>
                        <tr>
                            <th className="col-header w-1/3 text-right">ތަފްޞީލު</th>
                            <th className="col-header w-1/3 text-center">ތިބި އަދަދު</th>
                            <th className="col-header w-1/3 text-center">ތިބެންޖެހޭ އަދަދު</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mainItems.map((item, idx) => (
                            <tr key={idx}>
                                <td className="desc-col font-bold text-right py-2 px-4">{item.label}</td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        value={formData[item.actual] || ''}
                                        onChange={(e) => handleInputChange(item.actual, e.target.value)}
                                        className="form-input w-full text-center"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        value={formData[item.req] || ''}
                                        onChange={(e) => handleInputChange(item.req, e.target.value)}
                                        className="form-input w-full text-center"
                                        placeholder="0"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderTeacherQualificationTable = () => {
        const qualItems = [
            { label1: 'ލެވެލް 9ގެ ސަނަދު ލިބިފައިވާ މުދައްރިސުންގެ އަދަދު', field1: 'sp_t_lvl9_actual', label2: 'ލެވެލް 10ގެ ސަނަދު ލިބިފައިވާ މުދައްރިސުންގެ އަދަދު', field2: 'sp_t_lvl10_actual' },
            { label1: 'ލެވެލް 7ގެ ސަނަދު ލިބިފައިވާ މުދައްރިސުންގެ އަދަދު', field1: 'sp_t_lvl7_actual', label2: 'ލެވެލް 8ގެ ސަނަދު ލިބިފައިވާ މުދައްރިސުންގެ އަދަދު', field2: 'sp_t_lvl8_actual' },
            { label1: 'ލެވެލް 5ގެ ސަނަދު ލިބިފައިވާ މުދައްރިސުންގެ އަދަދު', field1: 'sp_t_lvl5_actual', label2: 'ލެވެލް 6ގެ ސަނަދު ލިބިފައިވާ މުދައްރިސުންގެ އަދަދު', field2: 'sp_t_lvl6_actual' },
        ];

        return (
            <div className="resource-section-card full-width">
                <table className="resource-table font-dhivehi" dir="rtl">
                    <thead>
                        <tr>
                            <th colSpan="4" className="resource-section-title">
                                މުދައްރިސުންގެ ސަނަދު ފެންވަރު
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {qualItems.map((item, idx) => (
                            <tr key={idx}>
                                <td className="desc-col font-bold text-right w-1/4 py-2 px-4">{item.label1}</td>
                                <td className="p-2 w-1/4">
                                    <input
                                        type="number"
                                        value={formData[item.field1] || ''}
                                        onChange={(e) => handleInputChange(item.field1, e.target.value)}
                                        className="form-input w-full text-center"
                                        placeholder="0"
                                    />
                                </td>
                                <td className="desc-col font-bold text-right w-1/4 py-2 px-4">{item.label2}</td>
                                <td className="p-2 w-1/4">
                                    <input
                                        type="number"
                                        value={formData[item.field2] || ''}
                                        onChange={(e) => handleInputChange(item.field2, e.target.value)}
                                        className="form-input w-full text-center"
                                        placeholder="0"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderTeacherMatrixTable = () => {
        return (
            <div className="resource-section-card full-width">
                <div className="p-4 bg-gray-50 border-b border-gray-200" dir="rtl">
                    <h3 className="font-dhivehi font-bold text-lg">މުދައްރިސުންގެ ތަފާސްހިސާބު</h3>
                </div>
                <div className="matrix-scroll-container p-4">
                    <table className="matrix-grid font-dhivehi text-center text-xs" dir="rtl">
                        <thead className="bg-gray-100">
                            <tr>
                                <th rowSpan="2" className="p-2 border bg-gray-100">ޖިންސް</th>
                                <th colSpan="4" className="p-2 border">މުދައްރިސުންގެ އަދަދު</th>
                                <th colSpan="5" className="p-2 border">ތަމްރީނުވެފައިވާ މުދައްރިސުންގެ އަދަދު</th>
                                <th colSpan="4" className="p-2 border">ތަމްރީނު ނުވާ މުދައްރިސުން އަދަދު</th>
                            </tr>
                            <tr className="text-xs">
                                {/* General/Total group */}
                                <th className="p-1 border bg-matrix-total text-white">ޖުމްލަ</th>
                                <th className="p-1 border">ސެން</th>
                                <th className="p-1 border">ބިދޭސީ</th>
                                <th className="p-1 border">ދޭސީ</th>

                                {/* Trained group */}
                                <th className="p-1 border bg-matrix-total text-white">ޖުމްލަ</th>
                                <th className="p-1 border">ސެން</th>
                                <th className="p-1 border">ވަގުތީ</th>
                                <th className="p-1 border">ބިދޭސީ</th>
                                <th className="p-1 border">ދޭސީ</th>

                                {/* Untrained group */}
                                <th className="p-1 border bg-matrix-total text-white">ޖުމްލަ</th>
                                <th className="p-1 border">ސެން</th>
                                <th className="p-1 border">ބިދޭސީ</th>
                                <th className="p-1 border">ދޭސީ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Female Row */}
                            <tr>
                                <td className="p-2 border font-bold">އަންހެން</td>

                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_tm_f_gen_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_gen_sen')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_gen_expat')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_gen_local')}</td>

                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_tm_f_tr_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_tr_sen')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_tr_temp')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_tr_expat')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_tr_local')}</td>

                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_tm_f_un_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_un_sen')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_un_expat')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_f_un_local')}</td>
                            </tr>

                            {/* Male Row */}
                            <tr>
                                <td className="p-2 border font-bold">ފިރިހެން</td>

                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_tm_m_gen_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_gen_sen')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_gen_expat')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_gen_local')}</td>

                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_tm_m_tr_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_tr_sen')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_tr_temp')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_tr_expat')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_tr_local')}</td>

                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_tm_m_un_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_un_sen')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_un_expat')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_m_un_local')}</td>
                            </tr>

                            {/* Total Row */}
                            <tr className="bg-gray-100 font-bold">
                                <td className="p-2 border">ޖުމްލަ</td>

                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_gen_total', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_gen_sen', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_gen_expat', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_gen_local', true, 'bg-transparent font-bold')}</td>

                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_tr_total', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_tr_sen', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_tr_temp', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_tr_expat', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_tr_local', true, 'bg-transparent font-bold')}</td>

                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_un_total', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_un_sen', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_un_expat', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_tm_t_un_local', true, 'bg-transparent font-bold')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderStudentMatrixTable = () => {
        return (
            <div className="resource-section-card full-width">
                <div className="p-4 bg-gray-50 border-b border-gray-200" dir="rtl">
                    <h3 className="font-dhivehi font-bold text-lg">ދަރިވަރުންގެ އަދަދު (SCLP ދަރިވަރުން ހިމަނައިގެން)</h3>
                </div>
                <div className="matrix-scroll-container p-4">
                    <table className="matrix-grid font-dhivehi text-center text-xs" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead className="bg-gray-100">
                            <tr>
                                <th rowSpan="2" className="p-2 border bg-gray-100">ޖިންސް</th>
                                <th className="p-1 border bg-matrix-total text-white" rowSpan="2">ޖުމްލަ</th>
                                <th colSpan="2" className="p-2 border">ފައުންޑޭޝަން</th>
                                <th colSpan="3" className="p-2 border">ކީސްޓޭޖް 1</th>
                                <th colSpan="3" className="p-2 border">ކީސްޓޭޖް 2</th>
                                <th colSpan="2" className="p-2 border">ކީސްޓޭޖް 3</th>
                                <th colSpan="2" className="p-2 border">ކީސްޓޭޖް 4</th>
                                <th colSpan="2" className="p-2 border">ކީސްޓޭޖް 5</th>
                            </tr>
                            <tr className="text-xs">
                                <th className="p-1 border w-12">LKG</th>
                                <th className="p-1 border w-12">UKG</th>
                                <th className="p-1 border w-12">1</th>
                                <th className="p-1 border w-12">2</th>
                                <th className="p-1 border w-12">3</th>
                                <th className="p-1 border w-12">4</th>
                                <th className="p-1 border w-12">5</th>
                                <th className="p-1 border w-12">6</th>
                                <th className="p-1 border w-12">7</th>
                                <th className="p-1 border w-12">8</th>
                                <th className="p-1 border w-12">9</th>
                                <th className="p-1 border w-12">10</th>
                                <th className="p-1 border w-12">11</th>
                                <th className="p-1 border w-12">12</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Female Row */}
                            <tr>
                                <td className="p-2 border font-bold">އަންހެން</td>
                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_s_f_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_lkg')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_ukg')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_1')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_2')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_3')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_4')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_5')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_6')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_7')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_8')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_9')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_10')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_11')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_f_12')}</td>
                            </tr>
                            {/* Male Row */}
                            <tr>
                                <td className="p-2 border font-bold">ފިރިހެން</td>
                                <td className="p-1 border bg-matrix-total text-white font-bold">{renderMatrixInput('sp_s_m_total', true, 'bg-transparent text-white font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_lkg')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_ukg')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_1')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_2')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_3')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_4')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_5')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_6')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_7')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_8')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_9')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_10')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_11')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_m_12')}</td>
                            </tr>
                            {/* Total Row */}
                            <tr className="bg-gray-100 font-bold">
                                <td className="p-2 border">ޖުމްލަ</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_total', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_lkg', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_ukg', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_1', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_2', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_3', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_4', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_5', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_6', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_7', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_8', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_9', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_10', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_11', true, 'bg-transparent font-bold')}</td>
                                <td className="p-1 border">{renderMatrixInput('sp_s_t_12', true, 'bg-transparent font-bold')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderSenMatrixTable = () => {
        const renderSubMatrix = (title, prefix) => (
            <div className="resource-section-card full-width mb-8">
                <div className="p-4 bg-gray-50 border-b border-gray-200" dir="rtl">
                    <h3 className="font-dhivehi font-bold text-lg">{title}</h3>
                </div>
                <div className="matrix-scroll-container p-4">
                    <table className="matrix-grid font-dhivehi text-center text-xs" dir="rtl" style={{ fontSize: '17px' }}>
                        <thead className="bg-gray-100">
                            <tr className="text-xs">
                                <th className="p-2 border">ޖިންސް</th>
                                <th className="p-1 border bg-matrix-total text-white">ޖުމްލަ</th>
                                <th className="p-1 border w-12">LKG</th>
                                <th className="p-1 border w-12">UKG</th>
                                <th className="p-1 border w-12">1</th>
                                <th className="p-1 border w-12">2</th>
                                <th className="p-1 border w-12">3</th>
                                <th className="p-1 border w-12">4</th>
                                <th className="p-1 border w-12">5</th>
                                <th className="p-1 border w-12">6</th>
                                <th className="p-1 border w-12">7</th>
                                <th className="p-1 border w-12">8</th>
                                <th className="p-1 border w-12">9</th>
                                <th className="p-1 border w-12">10</th>
                                <th className="p-1 border w-12">11</th>
                                <th className="p-1 border w-12">12</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['f', 'm'].map(row => (
                                <tr key={row}>
                                    <td className="p-2 border font-bold">{row === 'f' ? 'އަންހެން' : 'ފިރިހެން'}</td>
                                    <td className={`p-1 border bg-matrix-total text-white font-bold`}>{renderMatrixInput(`sp_${prefix}_${row}_total`, true, 'bg-transparent text-white font-bold')}</td>
                                    {['lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                                        <td key={grade} className="p-1 border">{renderMatrixInput(`sp_${prefix}_${row}_${grade}`)}</td>
                                    ))}
                                </tr>
                            ))}
                            <tr className="bg-gray-100 font-bold">
                                <td className="p-2 border">ޖުމްލަ</td>
                                <td className="p-1 border">{renderMatrixInput(`sp_${prefix}_t_total`, true, 'bg-transparent font-bold')}</td>
                                {['lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(grade => (
                                    <td key={grade} className="p-1 border">{renderMatrixInput(`sp_${prefix}_t_${grade}`, true, 'bg-transparent font-bold')}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );

        return (
            <>
                <div className="resource-section-card full-width mb-8">
                    <table className="resource-table font-dhivehi" dir="rtl">
                        <thead>
                            <tr>
                                <th colSpan="2" className="resource-section-title">
                                    ސެން ދަރިވަރުންގެ ޚުލާސާ
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="desc-col font-bold w-1/3">ޖުމްލަ ސެން ދަރިވަރުން</td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        value={formData.totalSenStudents || ''}
                                        onChange={(e) => handleInputChange('totalSenStudents', e.target.value)}
                                        className="form-input w-full text-center"
                                        placeholder="0"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="desc-col font-bold w-1/3">ސެން މުދައްރިސުން</td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        value={formData.senTeachers || ''}
                                        onChange={(e) => handleInputChange('senTeachers', e.target.value)}
                                        className="form-input w-full text-center"
                                        placeholder="0"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="desc-col font-bold w-1/3">ސެން ވަސީލަތްތައް</td>
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={formData.senFacilities || ''}
                                        onChange={(e) => handleInputChange('senFacilities', e.target.value)}
                                        className="form-input w-full text-right"
                                        placeholder=""
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {renderSubMatrix('ޚާއްޞަ އެހީއަށް ބޭނުންވާ ދަރިވަރުންގެ މަޢުލޫމާތު (އައިސީޕީ ހަދަންޖެހޭކަމަށް ޝައްކު ކުރެވޭ ދަރިވަރުން)', 'sen_s')}
                {renderSubMatrix('ޚާއްޞަ އެހީއަށް ބޭނުންވާ ދަރިވަރުންގެ މަޢުލޫމާތު (އައިސީޕީ އަށް ޑައިގްނޯސް ކުރި ދަރިވަރުން)', 'sen_d')}
            </>
        );
    };

    const renderLiteracyMatrixTable = () => {
        const renderLitSubMatrix = (title, prefix, hasFoundation = true) => {
            const grades = hasFoundation
                ? ['lkg', 'ukg', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
                : ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

            return (
                <div className="resource-section-card full-width mb-8">
                    <div className="p-4 bg-gray-50 border-b border-gray-200" dir="rtl">
                        <h3 className="font-dhivehi font-bold text-lg">{title}</h3>
                    </div>
                    <div className="matrix-scroll-container p-4">
                        <table className="matrix-grid font-dhivehi text-center text-xs" dir="rtl">
                            <thead className="bg-gray-100">
                                <tr className="text-xs">
                                    <th className="p-2 border">ޖިންސް</th>
                                    <th className="p-1 border bg-matrix-total text-white">ޖުމްލަ</th>
                                    {grades.map(g => (
                                        <th key={g} className="p-1 border w-12">{g.toUpperCase()}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {['f', 'm'].map(row => (
                                    <tr key={row}>
                                        <td className="p-2 border font-bold">{row === 'f' ? 'އަންހެން' : 'ފިރިހެން'}</td>
                                        <td className={`p-1 border bg-matrix-total text-white font-bold`}>{renderMatrixInput(`sp_${prefix}_${row}_total`, true, 'bg-transparent text-white font-bold')}</td>
                                        {grades.map(grade => (
                                            <td key={grade} className="p-1 border">{renderMatrixInput(`sp_${prefix}_${row}_${grade}`)}</td>
                                        ))}
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 font-bold">
                                    <td className="p-2 border">ޖުމްލަ</td>
                                    <td className="p-1 border">{renderMatrixInput(`sp_${prefix}_t_total`, true, 'bg-transparent font-bold')}</td>
                                    {grades.map(grade => (
                                        <td key={grade} className="p-1 border">{renderMatrixInput(`sp_${prefix}_t_${grade}`, true, 'bg-transparent font-bold')}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        };

        return (
            <>
                <div className="form-section-title full-width mb-4">
                    <h4 className="font-dhivehi">ލިޓްރަސީ (Literacy & Numeracy)</h4>
                </div>
                {renderLitSubMatrix('ދިވެހި ބަހުން ލިޔަންކިޔަން ނޭނގޭ ދަރިވަރުން', 'lit_dn', false)}
                {renderLitSubMatrix('އިނގިރޭސި ބަހުން ލިޔަންކިޔަން ނޭނގޭ ދަރިވަރުން', 'lit_en', false)}
                {renderLitSubMatrix('ދިވެހި ބަހުން ފެންވަރު ދަށް ދަރިވަރުން', 'lit_dg', true)}
                {renderLitSubMatrix('އިނގިރޭސި ބަހުން ފެންވަރު ދަށް ދަރިވަރުން', 'lit_eg', true)}
                {renderLitSubMatrix('ހިސާބުން ފެންވަރު ދަށް ދަރިވަރުން', 'lit_mg', true)}
            </>
        );
    };

    const renderSchoolExamResultsTable = () => {
        const renderGradeTable = (grade, subjects, labelDv) => {
            // Calculate Average Pass % for the grade
            let totalPassPct = 0;
            let countSubjects = 0;

            subjects.forEach(subject => {
                const studentCount = parseInt(formData[`sp_ser_gr${grade}_${subject.id}_count`] || 0);
                const passCount = parseInt(formData[`sp_ser_gr${grade}_${subject.id}_pass`] || 0);
                if (studentCount > 0) {
                    const passPct = (passCount / studentCount) * 100;
                    totalPassPct += passPct;
                    countSubjects++;
                }
            });

            const averagePassPct = countSubjects > 0 ? (totalPassPct / countSubjects).toFixed(1) : '0.0';

            const targetVal = formData[`sp_ser_gr${grade}_target_met`] || '';
            const targetColor = targetVal === 'yes' ? '#16a34a' : targetVal === 'no' ? '#dc2626' : '#6b7280';

            return (
                <div className="resource-section-card full-width mb-8" key={grade} style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    {/* Header with gradient */}
                    <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} dir="rtl">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 14px', fontSize: '1.1rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)' }}>{grade}</span>
                            <h3 className="font-dhivehi" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff', margin: 0 }}>{labelDv}</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label className="font-dhivehi" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)' }}>ޓާގެޓް ހާސިލުވެފައި ވޭ؟</label>
                            <select
                                value={targetVal}
                                onChange={(e) => handleInputChange(`sp_ser_gr${grade}_target_met`, e.target.value)}
                                style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
                            >
                                <option value="" style={{ color: '#333' }}>ޚިޔާރުކުރައްވާ</option>
                                <option value="yes" style={{ color: '#333' }}>އާނ (Yes)</option>
                                <option value="no" style={{ color: '#333' }}>ނޫން (No)</option>
                                <option value="na" style={{ color: '#333' }}>ނުގުޅޭ (N/A)</option>
                            </select>
                            {targetVal && (
                                <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: targetColor, boxShadow: `0 0 6px ${targetColor}` }}></span>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto" style={{ padding: '0' }}>
                        <table className="matrix-grid font-dhivehi text-center w-full" dir="rtl" style={{ fontSize: '17px' }}>
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 border font-bold" style={{ textAlign: 'right', width: '38%', letterSpacing: '0.02em' }}>މާއްދާ</th>
                                    <th className="p-2 border font-bold" style={{ width: '20%' }}>ފާސްވި އިންސައްތަ (%)</th>
                                    <th className="p-2 border font-bold" style={{ width: '21%' }}>ފާސްވި ދަރިވަރުންގެ އަދަދު</th>
                                    <th className="p-2 border font-bold" style={{ width: '21%' }}>ގްރޭޑްގެ ދަރިވަރުންގެ އަދަދު</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((subject, idx) => {
                                    const studentCount = parseInt(formData[`sp_ser_gr${grade}_${subject.id}_count`] || 0);
                                    const passCount = parseInt(formData[`sp_ser_gr${grade}_${subject.id}_pass`] || 0);
                                    const passPct = studentCount > 0 ? ((passCount / studentCount) * 100).toFixed(1) : '0.0';
                                    const pctNum = parseFloat(passPct);
                                    const isLow = pctNum < 50;
                                    const pctColor = studentCount > 0 ? (isLow ? '#ef4444' : '#22c55e') : undefined;
                                    const pctBg = studentCount > 0 ? (isLow ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)') : 'transparent';

                                    return (
                                        <tr key={subject.id} className={idx % 2 !== 0 ? 'bg-gray-50' : ''} style={{ transition: 'background 0.15s' }}>
                                            <td className="p-2 border font-semibold" style={{ textAlign: 'right' }}>{subject.dv}</td>
                                            <td className="p-1 border">
                                                <span style={{ display: 'inline-block', padding: '2px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '17px', color: pctColor, background: pctBg, minWidth: '52px' }}>
                                                    {studentCount > 0 ? `${passPct}%` : '-'}
                                                </span>
                                            </td>
                                            <td className="p-1 border">
                                                <input
                                                    type="number"
                                                    value={formData[`sp_ser_gr${grade}_${subject.id}_pass`] || ''}
                                                    onChange={(e) => handleInputChange(`sp_ser_gr${grade}_${subject.id}_pass`, e.target.value)}
                                                    className="form-input w-full text-center bg-transparent border-none focus:ring-0 p-0"
                                                    placeholder="0"
                                                    style={{ fontSize: '17px' }}
                                                />
                                            </td>
                                            <td className="p-1 border">
                                                <input
                                                    type="number"
                                                    value={formData[`sp_ser_gr${grade}_${subject.id}_count`] || ''}
                                                    onChange={(e) => handleInputChange(`sp_ser_gr${grade}_${subject.id}_count`, e.target.value)}
                                                    className="form-input w-full text-center bg-transparent border-none focus:ring-0 p-0"
                                                    placeholder="0"
                                                    style={{ fontSize: '17px' }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* Average Row */}
                                <tr style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
                                    <td style={{ padding: '10px 14px', border: '1px solid #1e3a5f', textAlign: 'right', fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>އެވަރެޖް</td>
                                    <td style={{ padding: '8px', border: '1px solid #1e3a5f', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                                        {averagePassPct}%
                                    </td>
                                    <td style={{ padding: '8px', border: '1px solid #1e3a5f', background: 'rgba(0,0,0,0.1)' }}></td>
                                    <td style={{ padding: '8px', border: '1px solid #1e3a5f', background: 'rgba(0,0,0,0.1)' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        };

        const subjectsGr7 = [
            { id: 'islam', dv: 'އިސްލާމް', en: 'Islam' },
            { id: 'dhivehi', dv: 'ދިވެހި', en: 'Dhivehi' },
            { id: 'english', dv: 'އިނގިރޭސި', en: 'English' },
            { id: 'math', dv: 'ހިސާބު', en: 'Mathematics' },
            { id: 'science', dv: 'ސައިންސް', en: 'Science' },
            { id: 'business', dv: 'ބިޒްނަސް ސްޓަޑީޒް', en: 'Business Studies' },
        ];

        const subjectsGr8To10 = [
            { id: 'islam', dv: 'އިސްލާމް', en: 'Islam' },
            { id: 'dhivehi', dv: 'ދިވެހި', en: 'Dhivehi' },
            { id: 'english', dv: 'އިނގިރޭސި', en: 'English' },
            { id: 'math', dv: 'ހިސާބު', en: 'Mathematics' },
            { id: 'chem', dv: 'ކެމިސްޓްރީ', en: 'Chemistry' },
            { id: 'phys', dv: 'ފިޒިކްސް', en: 'Physics' },
            { id: 'bio', dv: 'ބަޔޮލޮޖީ', en: 'Biology' },
            { id: 'marine', dv: 'މެރިން ސައިންސް', en: 'Marine Science' },
            { id: 'account', dv: 'އެކައުންޓިންގ', en: 'Accounting' },
            { id: 'business', dv: 'ބިޒްނަސް ސްޓަޑީޒް', en: 'Business Studies' },
            { id: 'econ', dv: 'އިކޮނޮމިކްސް', en: 'Economics' },
            { id: 'tt', dv: 'ޓްރެވަލް އެންޑް ޓުއަރިޒަމް', en: 'Travel & Tourism' },
            { id: 'history', dv: 'ހިސްޓްރީ', en: 'History' },
            { id: 'geo', dv: 'ޖިއޮގްރަފީ', en: 'Geography' },
            { id: 'lit', dv: 'ލިޓްރޭޗަރ', en: 'Literature' },
            { id: 'art', dv: 'އާޓް އެންޑް ޑިޒައިން', en: 'Art & Design' },
        ];

        const subjectsGr11To12 = [
            { id: 'islam', dv: 'އިސްލާމް', en: 'Islam' },
            { id: 'dhivehi', dv: 'ދިވެހި', en: 'Dhivehi' },
            { id: 'english', dv: 'އިނގިރޭސި', en: 'English' },
            { id: 'math', dv: 'މެތެމެޓިކްސް', en: 'Mathematics' },
            { id: 'fmath', dv: 'ފަރދަރ މެތެމެޓިކްސް', en: 'Further Mathematics' },
            { id: 'chem', dv: 'ކެމިސްޓްރީ', en: 'Chemistry' },
            { id: 'phys', dv: 'ފިޒިކްސް', en: 'Physics' },
            { id: 'bio', dv: 'ބަޔޮލޮޖީ', en: 'Biology' },
            { id: 'marine', dv: 'މެރިން ސައިންސް', en: 'Marine Science' },
            { id: 'account', dv: 'އެކައުންޓިންގ', en: 'Accounting' },
            { id: 'business', dv: 'ބިޒްނަސް ސްޓަޑީޒް', en: 'Business Studies' },
            { id: 'econ', dv: 'އިކޮނޮމިކްސް', en: 'Economics' },
            { id: 'tt', dv: 'ޓްރެވަލް އެންޑް ޓުއަރިޒަމް', en: 'Travel & Tourism' },
            { id: 'psych', dv: 'ސައިކޮލޮޖީ', en: 'Psychology' },
            { id: 'history', dv: 'ހިސްޓްރީ', en: 'History' },
            { id: 'geo', dv: 'ޖިއޮގްރަފީ', en: 'Geography' },
            { id: 'lit', dv: 'ލިޓްރޭޗަރ', en: 'Literature' },
            { id: 'art', dv: 'އާޓް އެންޑް ޑިޒައިން', en: 'Art & Design' },
        ];

        return (
            <>
                <div className="form-section-title full-width mb-6">
                    <h4 className="font-dhivehi">އެންމެ ފަހު އިމްތިޙާނުތަކުން ދަރިވަރުންނަށް ހާސިލުވި މިންވަރު (School Exam Results)</h4>
                </div>
                {renderGradeTable('7', subjectsGr7, 'ގްރޭޑް 7')}
                {renderGradeTable('8', subjectsGr8To10, 'ގްރޭޑް 8')}
                {renderGradeTable('9', subjectsGr8To10, 'ގްރޭޑް 9')}
                {renderGradeTable('10', subjectsGr8To10, 'ގްރޭޑް 10')}
                {renderGradeTable('11', subjectsGr11To12, 'ގްރޭޑް 11')}
                {renderGradeTable('12', subjectsGr11To12, 'ގްރޭޑް 12')}
            </>
        );
    };

    const renderExtracurricularTable = () => {
        // Section 1: Activities
        const activityItems = [
            { label: 'ދީނީ ހަރަކާތްތައް (Religious)', target: 'sp_ec_religious_target', part: 'sp_ec_religious_part' },
            { label: 'އަދަބީ ހަރަކާތްތައް (Literary)', target: 'sp_ec_literary_target', part: 'sp_ec_literary_part' },
            { label: 'ކުޅިވަރު ހަރަކާތްތައް (Sports)', target: 'sp_ec_sports_target', part: 'sp_ec_sports_part' },
            { label: 'ކުލަބު/ޖަމުއިއްޔާތައް (Clubs)', target: null, part: 'sp_ec_club_part' },
            { label: 'ޔުނިފޯމް ހަރަކާތްތައް (Uniform Bodies)', target: null, part: 'sp_ec_uniform_part' },
        ];

        // Section 2: Conduct
        const conductItems = [
            { label: 'ހުރިހާ ދަރިވަރުންގެ ހާޒިރީގެ އެވްރެޖް އިންސައްތަ', field: 'sp_conduct_attendance_avg' },
            { label: 'އަޚްލާޤީ މައްސަލައެއް ދިމާނުވާ ދަރިވަރުންގެ އިންސައްތަ', field: 'sp_conduct_no_issues_pct' },
            { label: 'ސްކޫލް ފެންވަރުގައި ހައްލުކުރެވޭ ފަދަ އަޚްލާޤީ ބޮޑެތި މައްސަލަތައް ދިމާވާ ދަރިވަރުންގެ އިންސައްތަ', field: 'sp_conduct_school_issues_pct' },
            { label: 'ޖުވެނައިލް ޖަސްޓިސް ހޯދަންޖެހޭ ފަދަ މައްސަލަތައް ދިމާވާ ދަރިވަރުންގެ އިންސައްތަ', field: 'sp_conduct_juvenile_issues_pct' },
        ];

        // Section 3: Leavers
        const leaversG10 = [
            { label: 'ގްރޭޑް 10 ނިންމި ދަރިވަރުންގެ އަދަދު', field: 'sp_leaver_g10_completed' },
            { label: 'ގްރޭޑް 10 ނިންމި ދަރިވަރުންގެ ތެރެއިން ގްރޭޑް 11 ގައި ކިޔަވަމުންދާ ދަރިވަރުންގެ އަދަދު', field: 'sp_leaver_g10_studying_g11' },
            { label: 'މަތީ ތައުލީމު ހާސިލުކުރަމުންދާ ދަރިވަރުންގެ އަދަދު', field: 'sp_leaver_g10_higher_ed' },
            { label: 'އާމްދަނީ ހޯދުމަށް މަސައްކަތްކުރާ ދަރިވަރުންގެ އަދަދު', field: 'sp_leaver_g10_employed' },
        ];

        const leaversG12 = [
            { label: 'ގްރޭޑް 12 ނިންމި ދަރިވަރުންގެ އަދަދު', field: 'sp_leaver_g12_completed' },
            { label: 'މަތީ ތައުލީމު ހާސިލުކުރަމުންދާ ދަރިވަރުންގެ އަދަދު', field: 'sp_leaver_g12_higher_ed' },
            { label: 'އާމްދަނީ ހޯދުމަށް މަސައްކަތްކުރާ ދަރިވަރުންގެ އަދަދު', field: 'sp_leaver_g12_employed' },
        ];

        return (
            <div className="space-y-8">
                {/* Section 1: Activities */}
                <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '32px', textAlign: 'center' }}>1</span>
                        <h3 className="font-dhivehi text-white font-bold text-lg m-0">ސްކޫލު ފެންވަރުގައި ރާވައި ހިންގާ އިތުރު ހަރަކާތްތަކުން ސްކޫލަށް ލިބިފައިވާ ކާމިޔާބީތައް</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="matrix-grid w-full font-dhivehi" dir="rtl" style={{ fontSize: '17px' }}>
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="p-3 border text-right">ހަރަކާތް</th>
                                    <th className="p-3 border text-center w-40">އަމާޒުވާ އަދަދު</th>
                                    <th className="p-3 border text-center w-40">ބައިވެރިވި އަދަދު</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activityItems.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''}>
                                        <td className="p-3 border font-semibold">{item.label}</td>
                                        <td className="p-2 border">
                                            {item.target ? (
                                                <input
                                                    type="number"
                                                    value={formData[item.target] || ''}
                                                    onChange={(e) => handleInputChange(item.target, e.target.value)}
                                                    className="form-input w-full text-center"
                                                    placeholder="0"
                                                />
                                            ) : <div className="bg-gray-100 h-8 rounded"></div>}
                                        </td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                value={formData[item.part] || ''}
                                                onChange={(e) => handleInputChange(item.part, e.target.value)}
                                                className="form-input w-full text-center"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 2: Conduct */}
                <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '32px', textAlign: 'center' }}>2</span>
                        <h3 className="font-dhivehi text-white font-bold text-lg m-0">ދަރިވަރުންގެ ސުލޫކު</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="matrix-grid w-full font-dhivehi" dir="rtl" style={{ fontSize: '17px' }}>
                            <tbody>
                                {conductItems.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 !== 0 ? 'bg-gray-50' : ''}>
                                        <td className="p-3 border font-semibold w-3/4">{item.label}</td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                value={formData[item.field] || ''}
                                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                className="form-input w-full text-center"
                                                placeholder="%"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 3: School Leavers */}
                <div className="resource-section-card full-width" style={{ overflow: 'hidden', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }} dir="rtl">
                        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '4px 10px', fontSize: '0.9rem', fontWeight: 700, color: '#fff', backdropFilter: 'blur(4px)', minWidth: '32px', textAlign: 'center' }}>3</span>
                        <h3 className="font-dhivehi text-white font-bold text-lg m-0">ސްކޫލް ނިންމާ ދަރިވަރުން</h3>
                    </div>

                    {/* Grade 10 Subsection */}
                    <div className="p-4 bg-gray-50 border-b font-dhivehi font-bold text-right" dir="rtl" style={{ fontSize: '17px' }}>
                        ފާއިތުވި އަހަރު ގްރޭޑް 10 ފުރިހަމަ ކުރި ދަރިވަރުންގެ ކުރިއެރުން
                    </div>
                    <div className="overflow-x-auto">
                        <table className="matrix-grid w-full font-dhivehi" dir="rtl" style={{ fontSize: '17px' }}>
                            <tbody>
                                {leaversG10.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 !== 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="p-3 border font-semibold w-3/4">{item.label}</td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                value={formData[item.field] || ''}
                                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                className="form-input w-full text-center"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Grade 12 Subsection */}
                    <div className="p-4 bg-gray-50 border-b border-t font-dhivehi font-bold text-right" dir="rtl" style={{ fontSize: '17px' }}>
                        ފާއިތުވި އަހަރު ގްރޭޑް 12 ފުރިހަމަ ކުރި ދަރިވަރުންގެ ކުރިއެރުން
                    </div>
                    <div className="overflow-x-auto">
                        <table className="matrix-grid w-full font-dhivehi" dir="rtl" style={{ fontSize: '17px' }}>
                            <tbody>
                                {leaversG12.map((item, idx) => (
                                    <tr key={idx} className={idx % 2 !== 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="p-3 border font-semibold w-3/4">{item.label}</td>
                                        <td className="p-2 border">
                                            <input
                                                type="number"
                                                value={formData[item.field] || ''}
                                                onChange={(e) => handleInputChange(item.field, e.target.value)}
                                                className="form-input w-full text-center"
                                                placeholder="0"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderSectionContent = (sectionId) => {
        switch (sectionId) {
            case 'basic':
                return renderBasicInfoTable();


            case 'management':
                return (
                    <>
                        {renderManagementSummaryTable()}
                        {renderStaffTable()}
                    </>
                );

            case 'contact':
                return renderContactTable();

            case 'administration':
                return (
                    <>
                        {renderAdministrationTable()}
                        {renderAdminStaffCountsTable()}
                    </>
                );

            case 'teachers':
                return (
                    <>
                        {renderTeacherMainTable()}
                        {renderTeacherQualificationTable()}
                        {renderTeacherMatrixTable()}
                    </>
                );

            case 'support':
                return (
                    <div className="form-grid">
                        {renderInput('Total Support Staff', 'ޖުމްލަ ސަޕޯޓް ސްޓާފް', 'totalSupportStaff', 'number', '0')}
                        {renderInput('Counselors', 'ކައުންސެލަރުން', 'counselors', 'number', '0')}
                        {renderInput('Librarians', 'ލައިބްރޭރިއަނުން', 'librarians', 'number', '0')}
                        {renderInput('Lab Assistants', 'ލެބް އެސިސްޓެންޓުން', 'labAssistants', 'number', '0')}
                        {renderInput('IT Staff', 'އައިޓީ ސްޓާފް', 'itStaff', 'number', '0')}
                    </div>
                );

            case 'students':
                return (
                    <>
                        {renderStudentMatrixTable()}
                        {renderSenMatrixTable()}
                    </>
                );

            case 'literacy':
                return renderLiteracyMatrixTable();

            case 'school_exam_results':
                return renderSchoolExamResultsTable();

            case 'resources':
                return (
                    <>
                        {/* ===== Section 1: Learning & Teaching Resources ===== */}
                        <div className="full-width" style={{ background: 'linear-gradient(135deg, #0f2945 0%, #1e3a5f 100%)', borderRadius: '12px', padding: '16px 24px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '14px' }} dir="rtl">
                            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>1</span>
                            <h4 className="font-dhivehi" style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#fff', letterSpacing: '0.01em' }}>އުނގެނުމާއި އުނގަންނައިދިނުމާ ގުޅޭ ވަސީލަތްތަކާއި އިންތިޒާމުތައް</h4>
                        </div>

                        {renderResourceTable('1.1', 'ދަރިވަރުންގެ ނިސްބަތުންނާއި ސްކޫލުގެ ދަންފަޅިއަށް ރިއާޔަތްކޮށް ހުރި ކްލާސްރޫމުތައް', [
                            { label: 'ކުލާސްރޫމު ހުންނަންޖެހޭ އަދަދު', field: 'sp_res_lt1_cr_req', type: 'number' },
                            { label: 'ކުލާސްރޫމު ހުރި އަދަދު', field: 'sp_res_lt1_cr_avail', type: 'number' },
                            { label: 'ކްލާސްރޫމުގައި ދަރިވަރުންގެ ފޮތްތައް ބެހެއްޓޭނެ އިންތިޒާމު ހަމަޖައްސާފައި ހުރޭ', field: 'sp_res_lt1_book_storage' },
                        ])}
                        {renderResourceTable('1.2', 'ދަރިވަރުންނާއި މުދައްރިސުންނަށް ބޭނުންކުރެވޭ ގޮތަށް ލައިބްރަރީ އިންތިޒާމުކުރުން', [
                            { label: 'ލައިބްރަރީއެއް ހުރޭ', field: 'sp_res_lt2_library' },
                            { label: 'ހުރިހާ އުމުރެއްގެ ދަރިވަރުންނާ ގުޅޭ ފޮތްތައް ބޭނުންވާ ވަރަށް ލައިބްރަރީގައި ހުރޭ', field: 'sp_res_lt2_books_all_ages' },
                            { label: 'މުދައްރިސުން ބޭނުންކުރުމަށް ރިފަރެންސް ފޮތް ހުރޭ', field: 'sp_res_lt2_ref_books' },
                        ])}
                        {renderResourceTable('1.3', 'ސައިންސްގެ މާއްދާތައް އުނގަންނައިދިނުމަށް ލެބޯޓަރީ/ސައިންސް ރޫމު އިންތިޒާމުކުރުން', [
                            { label: 'ލެބޯޓަރީ/ސައިންސް ރޫމެއް ހުރޭ', field: 'sp_res_lt3_lab' },
                            { label: 'ކެމިކަލްތަކާއި އިކްއިޕްމަންޓު ރައްކާތެރިކަމާއެކު ބެހެއްޓުމަށް ތަނެއް ހަމަޖައްސާފައި ހުރޭ', field: 'sp_res_lt3_chemical_storage' },
                            { label: 'ބޭނުންވާ ވަރަށް އިކުއިޕްމެންޓް ހުރޭ', field: 'sp_res_lt3_equipment' },
                            { label: 'ބޭނުންވާ ވަރަށް ކެމިކަލް ހުރޭ', field: 'sp_res_lt3_chemicals' },
                        ])}
                        {renderResourceTable('1.4', 'ކޮމްޕިއުޓަރ ސްޓަޑީޒް ކިޔަވާ ދަރިވަރުންނަށް ބޭނުންވާ ޚާއްޞަ ވަސީލަތްތައް ހުރުން', [
                            { label: 'ކޮމްޕިއުޓަރ ރޫމެއް/ލެބެއް ހުރޭ', field: 'sp_res_lt4_comp_room' },
                            { label: 'އުނގަންނައިދިނުން ކުރިއަށް ގެންދެވޭ މިންވަރަށް ކޮމްޕިއުޓަރ ސިސްޓަމް ހުރޭ', field: 'sp_res_lt4_comp_systems' },
                            { label: 'އިންޓަރނެޓްގެ ޚިދުމަތް ލިބެން ހުރޭ', field: 'sp_res_lt4_internet' },
                        ])}
                        {renderResourceTable('1.5', 'ފައުންޑޭޝަން ސްޓޭޖުގެ ދަރިވަރުންނަށް އައުޓްޑޯ އޭރިއާއެއް ތައްޔާރުކޮށްފައި އޮތުން', [
                            { label: 'އައުޓްޑޯ އޭރިއާއެއް އޮވޭ', field: 'sp_res_lt5_outdoor' },
                            { label: 'އައުޓްޑޯ އޭރިއާގައި ބޭނުންވާ ތަކެތި ހުރޭ', field: 'sp_res_lt5_outdoor_items' },
                        ])}
                        {renderResourceTable('1.6', 'އުނގެނުމާއި އުނގަންނައިދިނުމަށް ބޭނުންވާ މެޓީރިއަލް ޕްރިންޓްކުރެވޭނެ ވަޞީލަތްތައް ހުރުން', [
                            { label: 'ޕްރިންޓަރެއް / ޗާޕްމެޝިނެއް ހުރޭ', field: 'sp_res_lt6_printer' },
                            { label: 'ޕްރިންޓިންގެ މަސައްކަތްކުރާނެ ތަނެއް ހުރޭ', field: 'sp_res_lt6_print_room' },
                        ])}
                        {renderResourceTable('1.7', 'ބޭނުންވާ ޙާލަތްތަކުގައި، ޚާއްޞަ އެހީއަށް ބޭނުންވާ ދަރިވަރުން ބޭނުންކުރުމަށް ވަކި ތަނެއް ހުރޭ', [
                            { label: 'ޚާއްޞަ އެހީއަށް ބޭނުންވާ ދަރިވަރުން ބޭނުންކުރުމަށް ވަކި ތަނެއް ހުރޭ', field: 'sp_res_lt7_sen_room' },
                        ])}
                        {renderResourceTable('1.8', 'ހެލްތް އެންޑް ފިޒިކަލް އެޑިޔުކޭޝަން މާއްދާގެ ޕްރެކްޓިކަލް ގަޑިތައް ކުރިއަށް ގެންދިއުމަށް ވަކި ސަރަހައްދެއް ހަމަޖައްސާފައި ވޭ', [
                            { label: 'ހެލްތް އެންޑް ފިޒިކަލް އެޑިޔުކޭޝަން ޕްރެކްޓިކަލް ސަރަހައްދެއް ހުރޭ', field: 'sp_res_lt8_hpe_area' },
                        ])}

                        {/* ===== Section 2: Staff Resources ===== */}
                        <div className="full-width" style={{ background: 'linear-gradient(135deg, #0f2945 0%, #1e3a5f 100%)', borderRadius: '12px', padding: '16px 24px', marginTop: '2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '14px' }} dir="rtl">
                            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>2</span>
                            <h4 className="font-dhivehi" style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#fff', letterSpacing: '0.01em' }}>މުވައްޒަފުންނާ ގުޅޭ ވަސީލަތްތަކާއި އިންތިޒާމުތައް</h4>
                        </div>
                        {renderResourceTable('2.1', 'މުވައްޒަފުންގެ މަސައްކަތުގެ މާހައުލު', [
                            { label: 'ޕްރިންސިޕަލް މަސައްކަތްކުރުމަށް ވަކި ތަނެއް ހުރޭ', field: 'sp_res_sf1_principal_office' },
                            { label: 'ޑެޕިއުޓީ ޕްރިންސިޕަލުން/ޑެޕިއުޓީ ޕްރިންސިޕަލް މަސައްކަތްކުރުމަށް ވަކި ތަނެއް ހުރޭ', field: 'sp_res_sf1_dp_office' },
                            { label: 'އެޑްމިނިސްޓްރޭޓަރ މަސައްކަތްކުރުމަށް ވަކި ތަނެއް ހުރޭ', field: 'sp_res_sf1_admin_office' },
                            { label: 'ލީޑިން ޓީޗަރުން މަސައްކަތްކުރުމަށް ވަކި ތަނެއް ހުރޭ', field: 'sp_res_sf1_lt_office' },
                            { label: 'މުދައްރިސުން މަސައްކަތްކުރުމަށް ސްޓާފްރޫމެއް ހުރޭ', field: 'sp_res_sf1_staff_room' },
                            { label: 'އެހެނިހެން މުވައްޒަފުން މަސައްކަތްކުރުމަށް ތަނެއް ހުރޭ', field: 'sp_res_sf1_other_office' },
                            { label: 'އިދާރީ މުވައްޒަފުން މަސައްކަތްކުރުމަށް ތަނެއް ހުރޭ', field: 'sp_res_sf1_admin_staff_office' },
                            { label: 'ސަޕޯޓް ސްޓާފުން ތިބުމަށް ތަނެއް ހުރޭ', field: 'sp_res_sf1_support_office' },
                        ])}
                        {renderResourceTable('2.2', 'މުވައްޒަފުންނަށް ބޭނުންވާ ފަރުނީޗަރ', [
                            { label: 'ޕްރިންސިޕަލް މަސައްކަތްކުރާ ތަނުގައި ބޭނުންވާ ފަރުނީޗަރު ހުރޭ', field: 'sp_res_sf2_principal_furn' },
                            { label: 'ޑެޕިއުޓީ ޕްރިންސިޕަލުން/ޑެޕިއުޓީ ޕްރިންސިޕަލް މަސައްކަތްކުރާ ތަނުގައި ބޭނުންވާ ފަރުނީޗަރު ހުރޭ', field: 'sp_res_sf2_dp_furn' },
                            { label: 'އެޑްމިނިސްޓްރޭޓަރ މަސައްކަތްކުރާ ތަނުގައި ބޭނުންވާ ފަރުނީޗަރު ހުރޭ', field: 'sp_res_sf2_admin_furn' },
                            { label: 'ލީޑިން ޓީޗަރުން މަސައްކަތްކުރާ ތަނުގައި ބޭނުންވާ ގޮނޑި، މޭޒު ހުރޭ', field: 'sp_res_sf2_lt_chair_desk' },
                            { label: 'ލީޑިން ޓީޗަރުން މަސައްކަތްކުރާ ތަނުގައި ބޭނުންވާ ލޮކަރެއް ހުރޭ', field: 'sp_res_sf2_lt_locker' },
                            { label: 'ސްޓާފްރޫމުގައި މުދައްރިސުންނަށް ބޭނުންވާ ގޮނޑި، މޭޒު ހުރޭ', field: 'sp_res_sf2_teacher_chair_desk' },
                            { label: 'މުދައްރިސުންނަށް ބޭނުންވާ ލޮކަރެއް ހުރޭ', field: 'sp_res_sf2_teacher_locker' },
                            { label: 'އެހެނިހެން މުވައްޒަފުން މަސައްކަތްކުރާ ތަނުގައި ބޭނުންވާ ފަރުނީޗަރު ހުރޭ', field: 'sp_res_sf2_other_furn' },
                            { label: 'އިދާރީ މުވައްޒަފުން މަސައްކަތްކުރާ ތަނުގައި ބޭނުންވާ ފަރުނީޗަރު ހުރޭ', field: 'sp_res_sf2_admin_staff_furn' },
                            { label: 'ސަޕޯޓް ސްޓާފުން ތިބޭ ތަނުގައި ބޭނުންވާ ފަރުނީޗަރު ހުރޭ', field: 'sp_res_sf2_support_furn' },
                        ])}
                        {renderResourceTable('2.3', 'މުވައްޒަފުންނަށް ބޭނުންވާ ވަސީލަތްތައް (އިންޓަރނެޓް، ކޮމްޕިއުޓަރ، ފޯނު)', [
                            { label: 'ޕްރިންސިޕަލް މަސައްކަތްކުރުމަށް ބޭނުންވާ ވަސީލަތްތައް ހުރޭ', field: 'sp_res_sf3_principal_res' },
                            { label: 'ޑެޕިއުޓީ ޕްރިންސިޕަލުން/ޑެޕިއުޓީ ޕްރިންސިޕަލް މަސައްކަތްކުރުމަށް ބޭނުންވާ ވަސީލަތްތައް ހުރޭ', field: 'sp_res_sf3_dp_res' },
                            { label: 'އެޑްމިނިސްޓްރޭޓަރ މަސައްކަތްކުރުމަށް ބޭނުންވާ ވަސީލަތްތައް ހުރޭ', field: 'sp_res_sf3_admin_res' },
                            { label: 'ލީޑިން ޓީޗަރުން މަސައްކަތްކުރުމަށް ބޭނުންވާ ވަސީލަތްތައް ހުރޭ', field: 'sp_res_sf3_lt_res' },
                            { label: 'މުދައްރިސުން މަސައްކަތްކުރުމަށް ބޭނުންވާ ވަސީލަތްތައް ހުރޭ', field: 'sp_res_sf3_teacher_res' },
                            { label: 'އެހެނިހެން މުވައްޒަފުން މަސައްކަތްކުރުމަށް ބޭނުންވާ ވަސީލަތްތައް ހުރޭ', field: 'sp_res_sf3_other_res' },
                            { label: 'އިދާރީ މުވައްޒަފުން މަސައްކަތްކުރުމަށް ބޭނުންވާ ވަސީލަތްތައް ހުރޭ', field: 'sp_res_sf3_admin_staff_res' },
                        ])}

                        {/* ===== Section 3: Extra Activities Resources ===== */}
                        <div className="full-width" style={{ background: 'linear-gradient(135deg, #0f2945 0%, #1e3a5f 100%)', borderRadius: '12px', padding: '16px 24px', marginTop: '2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '14px' }} dir="rtl">
                            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>3</span>
                            <h4 className="font-dhivehi" style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#fff', letterSpacing: '0.01em' }}>އިތުރު ހަރަކާތްތަކާ ގުޅޭ ވަސީލަތްތަކާއި އިންތިޒާމުތައް</h4>
                        </div>
                        {renderResourceTable('3.1', 'ދަރިވަރުން ކުޅިވަރުކުޅުމަށް ވަކި ސަރަހައްދެއް ހަމަޖައްސާފައި ވޭ', [
                            { label: 'ދަރިވަރުން ކުޅިވަރުކުޅުމަށް ވަކި ސަރަހައްދެއް ހަމަޖައްސާފައި ވޭ', field: 'sp_res_ex1_sports_area' },
                        ])}
                        {renderResourceTable('3.2', 'ކަސްރަތާއި ކުޅިވަރު ހަރަކާތް ހިންގުމަށް ބޭނުންވާ ތަކެތި ލިބެން ހުރުން', [
                            { label: 'ކަސްރަތާއި ކުޅިވަރު ހަރަކާތްތައް ހިންގުމަށް ބޭނުންވާ ތަކެތި ހުރޭ', field: 'sp_res_ex2_sports_items' },
                            { label: 'ކަސްރަތާއި ކުޅިވަރު ހަރަކާތްތައް ހިންގުމަށް ބޭނުންވާ ތަކެތި ރައްކާތެރިކޮށް ބަހައްޓާނެ ތަނެއް ހުރޭ', field: 'sp_res_ex2_sports_storage' },
                        ])}
                        {renderResourceTable('3.3', 'ދަރިވަރުންނާއި މުވައްޒަފުންނަށް ނަމާދުކުރެވޭނެ އިންތިޒާމު ހަމަޖައްސާފައި ވުން', [
                            { label: 'ވުޟޫކުރެވޭނެ އިންތިޒާމު ހަމަޖައްސާފައި ވޭ', field: 'sp_res_ex3_wudu' },
                            { label: 'ނަމާދުކުރެވޭނެ އިންތިޒާމު ހަމަޖައްސާފައި ވޭ', field: 'sp_res_ex3_prayer' },
                        ])}
                        {renderResourceTable('3.4', 'އެކި އެކި ހަރަކާތްތަކާއި ހަފްލާތައް ބޭއްވުމަށް ސްކޫލުގައި ހޯލެއް އޮވޭ', [
                            { label: 'އެކި އެކި ހަރަކާތްތަކާއި ހަފްލާތައް ބޭއްވުމަށް ސްކޫލުގައި ހޯލެއް އޮވޭ', field: 'sp_res_ex4_hall' },
                        ])}

                        {/* ===== Section 4: Health & Safety Resources ===== */}
                        <div className="full-width" style={{ background: 'linear-gradient(135deg, #0f2945 0%, #1e3a5f 100%)', borderRadius: '12px', padding: '16px 24px', marginTop: '2rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '14px' }} dir="rtl">
                            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>4</span>
                            <h4 className="font-dhivehi" style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#fff', letterSpacing: '0.01em' }}>ޞިއްޙަތާ ރައްކާތެރިކަމާ ގުޅޭ ވަސީލަތްތަކާއި އިންތިޒާމުތައް</h4>
                        </div>
                        {renderResourceTable('4.1', 'ޞިއްޙަތާ ރައްކާތެރިކަމާ ގުޅޭ އިންތިޒާމު ހަމަޖެއްސުން', [
                            { label: 'ފުރަތަމަ އެހީ ދިނުމަށް ވަކި ތަނެއް ހުރޭ', field: 'sp_res_hs1_first_aid_room' },
                            { label: 'ފުރަތަމަ އެހީ ދިނުމަށް ބޭނުންވާ އަސާސީ ތަކެތި ހުރޭ', field: 'sp_res_hs1_first_aid_items' },
                            { label: 'ބޭނުންކުރެވޭ ހާލަތުގައި ތަކެތި ހުރޭ', field: 'sp_res_hs1_items_usable' },
                        ])}
                        {renderResourceTable('4.2', 'ދަރިވަރުންނާއި މުވައްޒަފުންނަށް ރައްކައުތެރި ބޯފެން ލިބޭނެ އިންތިޒާމު ހަމަޖެއްސުން', [
                            { label: 'ރައްކައުތެރި ބޯފެން ލިބެން ހުރޭ', field: 'sp_res_hs2_safe_water' },
                            { label: 'ފަސޭހައިން ބޯފެން ލިބޭނެ އިންތިޒާމު ހަމަޖައްސާފައި ހުރޭ', field: 'sp_res_hs2_water_access' },
                        ])}
                        {renderResourceTable('4.3', 'ދަރިވަރުންނާއި މުވައްޒަފުންނަށް ބޭނުންވާ އަދަދަށް ފާޚާނާ ހުރުން', [
                            { label: 'އަންހެން ދަރިވަރުންގެ ނިސްބަތުން ފާޚާނާ ހުންނަންޖެހޭ އަދަދު', field: 'sp_res_hs3_female_toilet_req', type: 'number' },
                            { label: 'އަންހެން ދަރިވަރުންގެ ފާޚާނާ ހުރި އަދަދު', field: 'sp_res_hs3_female_toilet_avail', type: 'number' },
                            { label: 'ފިރިހެން ދަރިވަރުންގެ ނިސްބަތުން ފާޚާނާ ހުންނަންޖެހޭ އަދަދު', field: 'sp_res_hs3_male_toilet_req', type: 'number' },
                            { label: 'ފިރިހެން ދަރިވަރުންގެ ފާޚާނާ ހުރި އަދަދު', field: 'sp_res_hs3_male_toilet_avail', type: 'number' },
                            { label: 'އަންހެން މުވައްޒަފުންނަށް ފާޚާނާ ހުރޭ', field: 'sp_res_hs3_female_staff_toilet' },
                            { label: 'ފިރިހެން މުވައްޒަފުންނަށް ފާޚާނާ ހުރޭ', field: 'sp_res_hs3_male_staff_toilet' },
                            { label: 'ފައުންޑޭޝަނާއި ގުރޭޑް 1ގެ ދަރިވަރުންގެ ފާޚާނާތައް އުމުރާ ގުޅޭ ގޮތަށް ހުރޭ', field: 'sp_res_hs3_foundation_toilet' },
                            { label: 'ޖިސްމާނީ ގޮތުން ޚާއްޞައެހީއަށް ބޭނުންވާ ފަރާތްތަކަށް ފާޚާނާ ހުރޭ', field: 'sp_res_hs3_sen_toilet' },
                        ])}
                        {renderResourceTable('4.4', 'ފަސޭހައިން އަތްދޮވެވޭނެ އިންތިޒާމު ހަމަޖައްސާފައި ހުރޭ', [
                            { label: 'ފަސޭހައިން އަތްދޮވެވޭނެ އިންތިޒާމު ހަމަޖައްސާފައި ހުރޭ', field: 'sp_res_hs4_hand_wash' },
                        ])}
                        {renderResourceTable('4.5', 'ކައުންސެލިން/ގައިޑެންސްދިނުމަށް ސިއްރު ހިފެހެއްޓޭ ފަދަ ތަނެއް ހަމަޖައްސާފައި ވޭ', [
                            { label: 'ކައުންސެލިން/ގައިޑެންސްދިނުމަށް ސިއްރު ހިފެހެއްޓޭ ފަދަ ތަނެއް ހަމަޖައްސާފައި ވޭ', field: 'sp_res_hs5_counseling_room' },
                        ])}
                        {renderResourceTable('4.6', 'ބޭނުންކުރެވޭ ހާލަތުގައި، މުއްދަތު ހަމަނުވާ އަލިފާންނިވި ހުރުން', [
                            { label: 'އަލިފާންނިވި ހުންނަންޖެހޭ އަދަދު', field: 'sp_res_hs6_fire_ext_req', type: 'number' },
                            { label: 'އަލިފާންނިވި ހުރި އަދަދު', field: 'sp_res_hs6_fire_ext_avail', type: 'number' },
                        ])}
                        {renderResourceTable('4.7', 'ޑިޕާޓްމަންޓް އޮފް ޕަބްލިކް އެގްޒަމިނޭޝަނުން ކަނޑައަޅާ މިންގަނޑުތަކާ އެއްގޮތަށް ސްކޫލުގައި ސޭފްރޫމެއް ހުރޭ', [
                            { label: 'ސޭފްރޫމެއް ހުރޭ', field: 'sp_res_hs7_safe_room' },
                        ])}
                    </>
                );

            case 'olevel_results':
                return (
                    <>
                        <div className="form-section-title full-width">
                            <h4 className="font-dhivehi">އޯލެވެލް ނަތީޖާ (O Level Results)</h4>
                        </div>
                        {renderOLevelResultTable()}
                        {renderOLevelTrendTable()}
                    </>
                );

            case 'alevel_results':
                return (
                    <>
                        <div className="form-section-title full-width">
                            <h4 className="font-dhivehi">އޭލެވެލް ނަތީޖާ (A Level Results)</h4>
                        </div>
                        {renderALevelResultTable()}
                        {renderALevelTrendTable()}
                    </>
                );

            case 'extracurricular':
                return (
                    <>
                        <div className="form-section-title full-width">
                            <h4 className="font-dhivehi">އިތުރު ހަރަކާތްތަކާއި އެހެނިހެން</h4>
                        </div>
                        {renderExtracurricularTable()}
                    </>
                );

            default:
                return <p>Section content not available</p>;
        }
    };

    const renderSecondaryTabs = () => {
        if (secondaryTabs.length === 0) return null;
        return (
            <div className="tab-row secondary-tabs">
                {secondaryTabs.map(tab => (
                    <button key={tab.id} className="tab-btn">{tab.label}</button>
                ))}
            </div>
        );
    };

    return (
        <div className="school-profile">
            {/* Header */}
            <header className="profile-header">
                <div className="profile-school-name">
                    <span className="title-en">{currentSchool?.name || "School Profile"}</span>
                    <span className="title-dv font-dhivehi" dir="rtl">{currentSchool?.nameDv || "ސްކޫލް ޕްރޮފައިލް"}</span>
                </div>
                <div className="header-actions">
                    <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                        <span>{isOnline ? (isSaving ? 'Saving...' : 'Online (Auto-Saving)') : 'Offline (Changes will not be saved)'}</span>
                    </div>
                </div>
            </header>

            {/* Primary Navigation Tabs */}
            <div className="tab-row-container">
                <div className="tab-row primary-tabs">
                    {primaryTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            <span className="tab-label font-dhivehi" dir="rtl">{tab.labelDv}</span>
                        </button>
                    ))}
                </div>

                {/* Secondary Tabs Row */}
                {renderSecondaryTabs()}
            </div>

            {/* Content Area */}
            <div className="profile-content" ref={contentRef}>
                {/* Content Header */}
                <div className="content-header">
                    <div className="content-title">
                        {currentTab && (
                            <>
                                <currentTab.icon size={24} className="content-icon" />
                                <div>
                                    {currentTab.label && <h2>{currentTab.label}</h2>}
                                    <span className="content-title-dv font-dhivehi" dir="rtl">
                                        {currentTab.labelDv}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="content-actions">
                        <div className="sync-status text-sm text-gray-500 italic">
                            {isSaving ? 'Saving changes...' : (lastSyncTime ? `Last saved: ${new Date(lastSyncTime).toLocaleTimeString()}` : '')}
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="form-content">
                    {renderSectionContent(activeTab)}
                </div>
            </div>
        </div>
    );
};

export default SchoolProfile;
