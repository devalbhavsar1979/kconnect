<?php
return [
    'readiness_token' => env('READINESS_TOKEN', ''),
    'synthetic_database' => (bool) env('PHASE2_SYNTHETIC_DATABASE', false),
    'required_tables' => ['users','categories','organizations','refresh_tokens','academic_details','achievements','experience_entries','user_expertise','user_preferences','user_service_delivery','opportunities','applications','opportunity_attachments'],
];
