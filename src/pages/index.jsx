import Layout from "./Layout.jsx";

import Home from "./Home";

import Services from "./Services";

import ShippingCalculator from "./ShippingCalculator";

import Store from "./Store";

import Contact from "./Contact";

import ReserveMailbox from "./ReserveMailbox";

import MyAccount from "./MyAccount";

import CreateShipment from "./CreateShipment";

import TestShippo from "./TestShippo";

import PaymentSuccess from "./PaymentSuccess";

import PaymentCancel from "./PaymentCancel";

import UHaulRentals from "./UHaulRentals";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Services: Services,
    
    ShippingCalculator: ShippingCalculator,
    
    Store: Store,
    
    Contact: Contact,
    
    ReserveMailbox: ReserveMailbox,
    
    MyAccount: MyAccount,
    
    CreateShipment: CreateShipment,
    
    TestShippo: TestShippo,
    
    PaymentSuccess: PaymentSuccess,
    
    PaymentCancel: PaymentCancel,
    
    UHaulRentals: UHaulRentals,
    
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
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Services" element={<Services />} />
                
                <Route path="/ShippingCalculator" element={<ShippingCalculator />} />
                
                <Route path="/Store" element={<Store />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/ReserveMailbox" element={<ReserveMailbox />} />
                
                <Route path="/MyAccount" element={<MyAccount />} />
                
                <Route path="/CreateShipment" element={<CreateShipment />} />
                
                <Route path="/TestShippo" element={<TestShippo />} />
                
                <Route path="/PaymentSuccess" element={<PaymentSuccess />} />
                
                <Route path="/PaymentCancel" element={<PaymentCancel />} />
                
                <Route path="/UHaulRentals" element={<UHaulRentals />} />
                
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