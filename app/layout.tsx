import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
title: "Bridge Lab",
description: "Visual performance notebook for basketball",
};

export default function RootLayout({
children,
}: {
children: ReactNode;
}) {
return (
<html lang="en">
<body>{children}</body>
</html>
);
}