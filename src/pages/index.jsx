import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import CreateSurvey from "./CreateSurvey";

import ManageSurveys from "./ManageSurveys";

import EditSurvey from "./EditSurvey";

import ManageAdmins from "./ManageAdmins";

import Survey from "./Survey";

import CancelReservation from "./CancelReservation";

import EmailTemplates from "./EmailTemplates";

import ThankYou from "./ThankYou";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    CreateSurvey: CreateSurvey,
    
    ManageSurveys: ManageSurveys,
    
    EditSurvey: EditSurvey,
    
    ManageAdmins: ManageAdmins,
    
    Survey: Survey,
    
    CancelReservation: CancelReservation,
    
    EmailTemplates: EmailTemplates,
    
    ThankYou: ThankYou,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/CreateSurvey" element={<CreateSurvey />} />
                
                <Route path="/ManageSurveys" element={<ManageSurveys />} />
                
                <Route path="/EditSurvey" element={<EditSurvey />} />
                
                <Route path="/ManageAdmins" element={<ManageAdmins />} />
                
                <Route path="/Survey" element={<Survey />} />
                
                <Route path="/CancelReservation" element={<CancelReservation />} />
                
                <Route path="/EmailTemplates" element={<EmailTemplates />} />
                
                <Route path="/ThankYou" element={<ThankYou />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}