<?php
return [
 'required'=>['title','opportunity_type','category','session_structure','total_duration','duration_per_session','short_description','detailed_description','event_date','language_of_delivery'],
 'defaults'=>['delivery_modes'=>[],'number_of_openings'=>1,'tags'=>[],'target_audience'=>[],'skills_required'=>[],'compensation_type'=>'TBD','travel_required'=>false,'travel_reimbursement'=>false,'visibility'=>'VISIBLE_TO_ALL','status'=>'DRAFT'],
 'rules'=>[
  'title'=>'string|max:512','opportunity_type'=>'in:LECTURE,CONTENT_COURSE_DEVELOPMENT,LANGUAGE_MEDIA,LEARNING_SUPPORT_EVALUATION,CONTENT_ELEARNING,EDITING_REVIEW','category'=>'string|max:200','sub_category'=>'nullable|string|max:200',
  'delivery_modes'=>'array','delivery_modes.*'=>'string','number_of_openings'=>'integer|min:1|max:2147483647','session_structure'=>'in:SINGLE_SESSION,MULTIPLE_SESSIONS,ONGOING_PROGRAM','total_duration'=>'string|max:100','duration_per_session'=>'string|max:100','organization_id'=>'nullable|uuid',
  'short_description'=>'string|max:500','detailed_description'=>'string','tags'=>'array','tags.*'=>'string','event_date'=>'date_format:Y-m-d','start_time'=>'nullable|string','end_time'=>'nullable|string','venue_name'=>'nullable|string|max:500','venue_location_type'=>'nullable|in:CORPORATE,INSTITUTE,UNIVERSITY,ONLINE,OTHERS','venue_address'=>'nullable|string','target_audience'=>'array','target_audience.*'=>'string',
  'skills_required'=>'array','skills_required.*'=>'string','minimum_experience'=>'nullable|string|max:100','expertise_level'=>'nullable|in:FRESHER,EXPERIENCED,EXPERT','additional_requirements'=>'nullable|string','language_of_delivery'=>'string|max:100',
  'preferred_location'=>'nullable|string|max:200','gender_preference'=>'nullable|string|max:50','candidate_preference'=>'nullable|string','notes_for_applicants'=>'nullable|string','application_deadline'=>'nullable|date_format:Y-m-d',
  'compensation_type'=>'in:PAID,VOLUNTARY,NEGOTIABLE,TBD','fee_structure'=>'nullable|in:PER_SESSION,PER_PROGRAM,PER_TASK','fee_amount'=>'nullable|numeric|between:-9999999999.99,9999999999.99','payment_terms'=>'nullable|string|max:200','travel_required'=>'boolean','travel_reimbursement'=>'boolean','other_benefits'=>'nullable|string','visibility'=>'in:VISIBLE_TO_ALL,SHORTLISTED_ONLY','status'=>'in:DRAFT,OPEN,CLOSED,CANCELLED,ARCHIVED'
 ]
];
