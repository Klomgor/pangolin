import { internal } from "@app/lib/api";
import { AxiosResponse } from "axios";
import { redirect } from "next/navigation";
import { authCookieHeader } from "@app/lib/api/cookies";
import { GetOrgUserResponse } from "@server/routers/user";
import OrgUserProvider from "@app/providers/OrgUserProvider";
import { HorizontalTabs } from "@app/components/HorizontalTabs";
import { cache } from "react";
import SettingsSectionTitle from "@app/components/SettingsSectionTitle";
import { getTranslations } from "next-intl/server";

interface UserLayoutProps {
    children: React.ReactNode;
    params: Promise<{ userId: string; orgId: string }>;
}

export default async function UserLayoutProps(props: UserLayoutProps) {
    const params = await props.params;

    const { children } = props;

    const t = await getTranslations();

    let user = null;
    try {
        const getOrgUser = cache(async () =>
            internal.get<AxiosResponse<GetOrgUserResponse>>(
                `/org/${params.orgId}/user/${params.userId}`,
                await authCookieHeader()
            )
        );
        const res = await getOrgUser();
        user = res.data.data;
    } catch {
        redirect(`/${params.orgId}/settings/sites`);
    }

    const navItems = [
        {
            title: t("accessControls"),
            href: "/{orgId}/settings/access/users/{userId}/access-controls"
        }
    ];

    return (
        <>
            <SettingsSectionTitle
                title={`${user?.email}`}
                description={t("userDescription2")}
            />
            <OrgUserProvider orgUser={user}>
                <HorizontalTabs items={navItems}>{children}</HorizontalTabs>
            </OrgUserProvider>
        </>
    );
}
