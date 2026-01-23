import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const useHrTour = () => {
    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            overlayColor: "rgba(0, 0, 0, 0.75)",
            popoverClass: "driverjs-theme",
            steps: [
                {
                    element: "#welcome-section",
                    popover: {
                        title: "Welcome to HiringBazaar! 👋",
                        description: "We're excited to help you streamline your hiring process. Let's take a quick tour of your new dashboard.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#create-job-button",
                    popover: {
                        title: "Post Your First Vacancy",
                        description: "Ready to find your next star? Click here to create a new job posting in just a few steps.",
                        side: "left",
                        align: "center",
                    },
                },
                {
                    element: "#stats-section",
                    popover: {
                        title: "At-a-glance Insights",
                        description: "Monitor your active jobs, candidate pipeline, and hiring progress in real-time.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#recent-jobs-section",
                    popover: {
                        title: "Manage Your Postings",
                        description: "View and manage your recent job posts here. You can check candidates, edit drafts, or delete postings.",
                        side: "top",
                        align: "center",
                    },
                },
                {
                    element: "#main-nav",
                    popover: {
                        title: "Easy Navigation",
                        description: "Quickly switch between your Dashboard, full Jobs list, and all Candidates from here.",
                        side: "bottom",
                        align: "center",
                    },
                },
                {
                    popover: {
                        title: "You're All Set! 🚀",
                        description: "That's it for the tour. If you need any help, our support team is just a click away. Happy hiring!",
                    },
                },
            ],
        });

        driverObj.drive();
    };

    return { startTour };
};

export default useHrTour;
