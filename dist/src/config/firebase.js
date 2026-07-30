import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../../careerforge_admin.json" with { type: "json" };
if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}
const firebaseAuth = getAuth();
export { firebaseAuth };
//# sourceMappingURL=firebase.js.map