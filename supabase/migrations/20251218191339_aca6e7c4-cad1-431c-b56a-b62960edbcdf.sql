-- Fix incorrect team name translation
UPDATE matches SET home_team = 'Real Oviedo' WHERE home_team = 'Véritable Oviedo';
UPDATE matches SET away_team = 'Real Oviedo' WHERE away_team = 'Véritable Oviedo';

-- Also fix other potential translation issues
UPDATE matches SET home_team = 'Real Madrid' WHERE home_team = 'Véritable Madrid';
UPDATE matches SET away_team = 'Real Madrid' WHERE away_team = 'Véritable Madrid';