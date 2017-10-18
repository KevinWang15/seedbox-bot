import { UserTaskCollection } from "../components/UserTaskManager";
import { User } from "../models/User";
import { UserTask } from "./UserTask";

async function ScanAndAddNewUsers() {
  let allUsers;
  let existingUserIds = UserTaskCollection.map(_ => _.user_id);
  allUsers = await User.findAll({
    where: {
      enabled: 1,
    },
  });
  allUsers.forEach(user => {
    if (existingUserIds.indexOf(user.id) >= 0) return;
    let userTask = new UserTask(user.id);
    UserTaskCollection.push(userTask);
    userTask.start();
  });
}

export { ScanAndAddNewUsers };