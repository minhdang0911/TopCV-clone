const fs = require('fs');

const clientPath = 'D:/top cv clone/topcv-backend/node_modules/.prisma/client/index.js';
let src = fs.readFileSync(clientPath, 'utf8');

// Full runtimeDataModel matching current schema.prisma
const runtimeDataModel = {
  models: {
    User: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'email', kind: 'scalar', type: 'String' },
        { name: 'passwordHash', kind: 'scalar', type: 'String', dbName: 'password_hash' },
        { name: 'phone', kind: 'scalar', type: 'String' },
        { name: 'role', kind: 'enum', type: 'Role' },
        { name: 'isVerified', kind: 'scalar', type: 'Boolean', dbName: 'is_verified' },
        { name: 'isActive', kind: 'scalar', type: 'Boolean', dbName: 'is_active' },
        { name: 'twoFactorEnabled', kind: 'scalar', type: 'Boolean', dbName: 'two_factor_enabled' },
        { name: 'provider', kind: 'scalar', type: 'String' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'updatedAt', kind: 'scalar', type: 'DateTime', dbName: 'updated_at' },
        { name: 'plan', kind: 'scalar', type: 'String' },
        { name: 'planExpiresAt', kind: 'scalar', type: 'DateTime', dbName: 'plan_expires_at' },
        { name: 'fcmToken', kind: 'scalar', type: 'String', dbName: 'fcm_token' },
        { name: 'candidateProfile', kind: 'object', type: 'CandidateProfile', relationName: 'CandidateProfileToUser' },
        { name: 'employerProfile', kind: 'object', type: 'EmployerProfile', relationName: 'EmployerProfileToUser' },
        { name: 'refreshTokens', kind: 'object', type: 'RefreshToken', relationName: 'RefreshTokenToUser' },
        { name: 'auditLogs', kind: 'object', type: 'AuditLog', relationName: 'AuditLogToUser' },
        { name: 'resumes', kind: 'object', type: 'Resume', relationName: 'ResumeToUser' },
        { name: 'coverLetters', kind: 'object', type: 'CoverLetter', relationName: 'CoverLetterToUser' },
        { name: 'payments', kind: 'object', type: 'Payment', relationName: 'PaymentToUser' },
        { name: 'companyFollows', kind: 'object', type: 'CompanyFollow', relationName: 'CompanyFollowToUser' },
        { name: 'companyReviews', kind: 'object', type: 'CompanyReview', relationName: 'CompanyReviewToUser' },
        { name: 'applications', kind: 'object', type: 'Application', relationName: 'ApplicationToUser' },
        { name: 'savedJobs', kind: 'object', type: 'SavedJob', relationName: 'SavedJobToUser' },
      ],
      dbName: 'users',
    },
    CandidateProfile: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'fullName', kind: 'scalar', type: 'String', dbName: 'full_name' },
        { name: 'avatarUrl', kind: 'scalar', type: 'String', dbName: 'avatar_url' },
        { name: 'isLookingForJob', kind: 'scalar', type: 'Boolean', dbName: 'is_looking_for_job' },
        { name: 'allowEmployerSearch', kind: 'scalar', type: 'Boolean', dbName: 'allow_employer_search' },
        { name: 'jobPreferences', kind: 'scalar', type: 'Json', dbName: 'job_preferences' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'CandidateProfileToUser' },
      ],
      dbName: 'candidate_profiles',
    },
    EmployerProfile: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'companyName', kind: 'scalar', type: 'String', dbName: 'company_name' },
        { name: 'logoUrl', kind: 'scalar', type: 'String', dbName: 'logo_url' },
        { name: 'companySize', kind: 'scalar', type: 'String', dbName: 'company_size' },
        { name: 'industryId', kind: 'scalar', type: 'Int', dbName: 'industry_id' },
        { name: 'website', kind: 'scalar', type: 'String' },
        { name: 'address', kind: 'scalar', type: 'String' },
        { name: 'description', kind: 'scalar', type: 'String' },
        { name: 'taxCode', kind: 'scalar', type: 'String', dbName: 'tax_code' },
        { name: 'slug', kind: 'scalar', type: 'String' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'emailNotificationEnabled', kind: 'scalar', type: 'Boolean', dbName: 'email_notification_enabled' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'EmployerProfileToUser' },
        { name: 'industry', kind: 'object', type: 'Industry', relationName: 'EmployerProfileToIndustry' },
        { name: 'jobs', kind: 'object', type: 'Job', relationName: 'EmployerProfileToJob' },
        { name: 'followers', kind: 'object', type: 'CompanyFollow', relationName: 'CompanyFollowToEmployerProfile' },
        { name: 'reviews', kind: 'object', type: 'CompanyReview', relationName: 'CompanyReviewToEmployerProfile' },
        { name: 'emailTemplates', kind: 'object', type: 'EmailTemplate', relationName: 'EmailTemplateToEmployerProfile' },
      ],
      dbName: 'employer_profiles',
    },
    CompanyFollow: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'employerProfileId', kind: 'scalar', type: 'String', dbName: 'employer_profile_id' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'CompanyFollowToUser' },
        { name: 'employerProfile', kind: 'object', type: 'EmployerProfile', relationName: 'CompanyFollowToEmployerProfile' },
      ],
      dbName: 'company_follows',
    },
    CompanyReview: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'employerProfileId', kind: 'scalar', type: 'String', dbName: 'employer_profile_id' },
        { name: 'rating', kind: 'scalar', type: 'Int' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'CompanyReviewToUser' },
        { name: 'employerProfile', kind: 'object', type: 'EmployerProfile', relationName: 'CompanyReviewToEmployerProfile' },
      ],
      dbName: 'company_reviews',
    },
    Industry: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'Int' },
        { name: 'name', kind: 'scalar', type: 'String' },
        { name: 'slug', kind: 'scalar', type: 'String' },
        { name: 'employerProfiles', kind: 'object', type: 'EmployerProfile', relationName: 'EmployerProfileToIndustry' },
        { name: 'jobs', kind: 'object', type: 'Job', relationName: 'IndustryToJob' },
      ],
      dbName: 'industries',
    },
    JobPosition: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'Int' },
        { name: 'name', kind: 'scalar', type: 'String' },
        { name: 'slug', kind: 'scalar', type: 'String' },
        { name: 'jobs', kind: 'object', type: 'Job', relationName: 'JobToJobPosition' },
      ],
      dbName: 'job_positions',
    },
    Job: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'employerId', kind: 'scalar', type: 'String', dbName: 'employer_id' },
        { name: 'title', kind: 'scalar', type: 'String' },
        { name: 'slug', kind: 'scalar', type: 'String', dbName: 'slug' },
        { name: 'description', kind: 'scalar', type: 'String' },
        { name: 'salaryMin', kind: 'scalar', type: 'Int', dbName: 'salary_min' },
        { name: 'salaryMax', kind: 'scalar', type: 'Int', dbName: 'salary_max' },
        { name: 'salaryType', kind: 'scalar', type: 'String', dbName: 'salary_type' },
        { name: 'jobType', kind: 'scalar', type: 'String', dbName: 'job_type' },
        { name: 'experience', kind: 'scalar', type: 'String' },
        { name: 'level', kind: 'enum', type: 'JobLevel' },
        { name: 'workingType', kind: 'enum', type: 'WorkingType', dbName: 'working_type' },
        { name: 'workingDays', kind: 'enum', type: 'WorkingDays', dbName: 'working_days' },
        { name: 'workingDaysNote', kind: 'scalar', type: 'String', dbName: 'working_days_note' },
        { name: 'quantity', kind: 'scalar', type: 'Int' },
        { name: 'deadline', kind: 'scalar', type: 'DateTime' },
        { name: 'isActive', kind: 'scalar', type: 'Boolean', dbName: 'is_active' },
        { name: 'industryId', kind: 'scalar', type: 'Int', dbName: 'industry_id' },
        { name: 'jobPositionId', kind: 'scalar', type: 'Int', dbName: 'job_position_id' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'updatedAt', kind: 'scalar', type: 'DateTime', dbName: 'updated_at' },
        { name: 'employer', kind: 'object', type: 'EmployerProfile', relationName: 'EmployerProfileToJob' },
        { name: 'industry', kind: 'object', type: 'Industry', relationName: 'IndustryToJob' },
        { name: 'jobPosition', kind: 'object', type: 'JobPosition', relationName: 'JobToJobPosition' },
        { name: 'locations', kind: 'object', type: 'JobLocation', relationName: 'JobToJobLocation' },
        { name: 'applications', kind: 'object', type: 'Application', relationName: 'ApplicationToJob' },
        { name: 'savedByUsers', kind: 'object', type: 'SavedJob', relationName: 'JobToSavedJob' },
      ],
      dbName: 'jobs',
    },
    JobLocation: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'jobId', kind: 'scalar', type: 'String', dbName: 'job_id' },
        { name: 'provinceCode', kind: 'scalar', type: 'String', dbName: 'province_code' },
        { name: 'provinceName', kind: 'scalar', type: 'String', dbName: 'province_name' },
        { name: 'districtCode', kind: 'scalar', type: 'String', dbName: 'district_code' },
        { name: 'districtName', kind: 'scalar', type: 'String', dbName: 'district_name' },
        { name: 'address', kind: 'scalar', type: 'String' },
        { name: 'job', kind: 'object', type: 'Job', relationName: 'JobToJobLocation' },
        { name: 'applications', kind: 'object', type: 'Application', relationName: 'ApplicationToJobLocation' },
      ],
      dbName: 'job_locations',
    },
    Resume: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'type', kind: 'scalar', type: 'String' },
        { name: 'title', kind: 'scalar', type: 'String' },
        { name: 'template', kind: 'scalar', type: 'String' },
        { name: 'color', kind: 'scalar', type: 'String' },
        { name: 'fontSize', kind: 'scalar', type: 'String' },
        { name: 'lineSpacing', kind: 'scalar', type: 'Float', dbName: 'line_spacing' },
        { name: 'background', kind: 'scalar', type: 'String' },
        { name: 'content', kind: 'scalar', type: 'Json' },
        { name: 'isPublic', kind: 'scalar', type: 'Boolean', dbName: 'is_public' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'updatedAt', kind: 'scalar', type: 'DateTime', dbName: 'updated_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'ResumeToUser' },
        { name: 'applications', kind: 'object', type: 'Application', relationName: 'ApplicationToResume' },
      ],
      dbName: 'resumes',
    },
    Application: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'jobId', kind: 'scalar', type: 'String', dbName: 'job_id' },
        { name: 'candidateId', kind: 'scalar', type: 'String', dbName: 'candidate_id' },
        { name: 'locationId', kind: 'scalar', type: 'String', dbName: 'location_id' },
        { name: 'resumeId', kind: 'scalar', type: 'String', dbName: 'resume_id' },
        { name: 'cvFileUrl', kind: 'scalar', type: 'String', dbName: 'cv_file_url' },
        { name: 'coverLetter', kind: 'scalar', type: 'String', dbName: 'cover_letter' },
        { name: 'coverLetterId', kind: 'scalar', type: 'String', dbName: 'cover_letter_id' },
        { name: 'status', kind: 'enum', type: 'ApplicationStatus' },
        { name: 'note', kind: 'scalar', type: 'String' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'updatedAt', kind: 'scalar', type: 'DateTime', dbName: 'updated_at' },
        { name: 'job', kind: 'object', type: 'Job', relationName: 'ApplicationToJob' },
        { name: 'candidate', kind: 'object', type: 'User', relationName: 'ApplicationToUser' },
        { name: 'location', kind: 'object', type: 'JobLocation', relationName: 'ApplicationToJobLocation' },
        { name: 'resume', kind: 'object', type: 'Resume', relationName: 'ApplicationToResume' },
      ],
      dbName: 'applications',
    },
    SavedJob: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'jobId', kind: 'scalar', type: 'String', dbName: 'job_id' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'SavedJobToUser' },
        { name: 'job', kind: 'object', type: 'Job', relationName: 'JobToSavedJob' },
      ],
      dbName: 'saved_jobs',
    },
    EmailTemplate: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'employerId', kind: 'scalar', type: 'String', dbName: 'employer_id' },
        { name: 'type', kind: 'enum', type: 'EmailTemplateType' },
        { name: 'subject', kind: 'scalar', type: 'String' },
        { name: 'body', kind: 'scalar', type: 'String' },
        { name: 'isDefault', kind: 'scalar', type: 'Boolean', dbName: 'is_default' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'updatedAt', kind: 'scalar', type: 'DateTime', dbName: 'updated_at' },
        { name: 'employer', kind: 'object', type: 'EmployerProfile', relationName: 'EmailTemplateToEmployerProfile' },
      ],
      dbName: 'email_templates',
    },
    Payment: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'gateway', kind: 'scalar', type: 'String' },
        { name: 'orderId', kind: 'scalar', type: 'String', dbName: 'order_id' },
        { name: 'amount', kind: 'scalar', type: 'Int' },
        { name: 'plan', kind: 'scalar', type: 'String' },
        { name: 'status', kind: 'scalar', type: 'String' },
        { name: 'gatewayData', kind: 'scalar', type: 'Json', dbName: 'gateway_data' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'updatedAt', kind: 'scalar', type: 'DateTime', dbName: 'updated_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'PaymentToUser' },
      ],
      dbName: 'payments',
    },
    CoverLetter: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'title', kind: 'scalar', type: 'String' },
        { name: 'templateId', kind: 'scalar', type: 'String', dbName: 'template_id' },
        { name: 'color', kind: 'scalar', type: 'String' },
        { name: 'font', kind: 'scalar', type: 'String' },
        { name: 'fontSize', kind: 'scalar', type: 'String', dbName: 'font_size' },
        { name: 'lineSpacing', kind: 'scalar', type: 'Float', dbName: 'line_spacing' },
        { name: 'content', kind: 'scalar', type: 'Json' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'updatedAt', kind: 'scalar', type: 'DateTime', dbName: 'updated_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'CoverLetterToUser' },
      ],
      dbName: 'cover_letters',
    },
    RefreshToken: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'token', kind: 'scalar', type: 'String' },
        { name: 'expiresAt', kind: 'scalar', type: 'DateTime', dbName: 'expires_at' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'RefreshTokenToUser' },
      ],
      dbName: 'refresh_tokens',
    },
    AuditLog: {
      fields: [
        { name: 'id', kind: 'scalar', type: 'String' },
        { name: 'userId', kind: 'scalar', type: 'String', dbName: 'user_id' },
        { name: 'action', kind: 'scalar', type: 'String' },
        { name: 'entity', kind: 'scalar', type: 'String' },
        { name: 'entityId', kind: 'scalar', type: 'String', dbName: 'entity_id' },
        { name: 'oldData', kind: 'scalar', type: 'Json', dbName: 'old_data' },
        { name: 'newData', kind: 'scalar', type: 'Json', dbName: 'new_data' },
        { name: 'ipAddress', kind: 'scalar', type: 'String', dbName: 'ip_address' },
        { name: 'createdAt', kind: 'scalar', type: 'DateTime', dbName: 'created_at' },
        { name: 'user', kind: 'object', type: 'User', relationName: 'AuditLogToUser' },
      ],
      dbName: 'audit_logs',
    },
  },
  enums: {},
  types: {},
};

const newJson = JSON.stringify(runtimeDataModel);

// Find and replace the runtimeDataModel assignment
const marker = 'config.runtimeDataModel = JSON.parse("';
const startIdx = src.indexOf(marker);
if (startIdx === -1) { console.error('runtimeDataModel not found'); process.exit(1); }

const afterMarker = startIdx + marker.length;
let i = afterMarker;
// Find the closing "); after the JSON string
while (i < src.length) {
  if (src[i] === '"' && src[i-1] !== '\\' && src[i+1] === ')') break;
  i++;
}

const escaped = JSON.stringify(newJson).slice(1, -1);
const newSrc = src.slice(0, startIdx) +
  marker + escaped + '")\n' +
  src.slice(i + 2);

fs.writeFileSync(clientPath, newSrc);
console.log('Updated runtimeDataModel');

// Verify
const check = fs.readFileSync(clientPath, 'utf8');
const modelMatch = check.match(/"models":\{(.*?)"enums"/);
if (modelMatch) {
  const models = [...check.matchAll(/"(\w+)":\{"fields"/g)].map(m => m[1]);
  console.log('Models in runtimeDataModel:', models.join(', '));
}
