import UserAvatar from '../UserAvatar';

export default function UserAvatarExample() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4 items-center">
        <UserAvatar name="John Smith" role="contractor" size="sm" />
        <UserAvatar name="Sarah Jones" role="homeowner" size="md" showRole />
        <UserAvatar name="Mike Wilson" role="supplier" size="lg" showRole />
      </div>
      <div className="flex gap-4 items-center">
        <UserAvatar name="Lisa Chen" role="architect" showRole />
        <UserAvatar name="Bob Miller" role="diy" showRole />
      </div>
    </div>
  );
}