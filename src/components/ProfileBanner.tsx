import { useAccountProfile, useLoyaltyPoints, type UseAccountProfileResult, type UseLoyaltyPointsResult } from "../hooks/useAccount";

export interface UserProfileBannerProps {
  accountId?: string;
  title?: string;
}

export interface LoyaltyStripProps {
  userId?: string;
  label?: string;
  initialPoints?: number;
}

export interface UserProfileBannerViewProps extends UserProfileBannerProps {
  profile: UseAccountProfileResult;
}

export interface LoyaltyStripViewProps extends LoyaltyStripProps {
  loyalty: UseLoyaltyPointsResult;
}

export function UserProfileBannerView({ title, profile }: UserProfileBannerViewProps) {
  const { data, loading, error } = profile;

  return (
    <section>
      <header>{title}</header>
      {loading ? <p>Loading...</p> : null}
      {error ? <p>Unable to load profile</p> : null}
      {!loading && !error && data?.name ? <p>{data.name}</p> : null}
      {!loading && !error ? <pre>{JSON.stringify(data, null, 2)}</pre> : null}
    </section>
  );
}

export function LoyaltyStripView({ label, loyalty }: LoyaltyStripViewProps) {
  const { points, loading, error } = loyalty;

  return (
    <aside>
      <span>{label}</span>
      {loading ? <em>Loading...</em> : null}
      {error ? <em>Unable to load loyalty points</em> : null}
      {!loading && !error ? <strong>{String(points ?? "")}</strong> : null}
    </aside>
  );
}

export function UserProfileBanner(props: UserProfileBannerProps) {
  const profile = useAccountProfile(props.accountId);
  return <UserProfileBannerView {...props} profile={profile} />;
}

export function LoyaltyStrip(props: LoyaltyStripProps) {
  const loyalty = useLoyaltyPoints(props.userId, props.initialPoints);
  return <LoyaltyStripView {...props} loyalty={loyalty} />;
}
