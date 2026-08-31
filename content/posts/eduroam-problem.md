+++
title = "Changed Universities and Can’t Log In to eduroam on macOS? Check for an Old 802.1X Profile First"
date = 2026-08-31T11:54:00+08:00
slug = "Eduroam_Problem"
tags = ["Eduroam", "Frea"]
draft = false
+++

## The answer first

If eduroam works on your phone but rejects the same credentials on your Mac—and you previously used eduroam through another university—check which institution’s 802.1X configuration the Mac is actually applying.

Open:

**System Settings → Wi-Fi → Details next to eduroam → 802.1X**

Look for:

- the name of your former university;
- an old institutional identity or realm after `@`;
- a RADIUS or authentication server belonging to the old university;
- certificates or certificate authorities specified by the old university;
- a named institutional profile when your current university expects `802.1X: Standard`.

If any of those values belong to your former institution while you are entering credentials from your new institution, the old profile may be controlling the shared `eduroam` SSID.

Do not erase the Mac, migrate to another user account, or delete the entire network configuration. Identify and remove only the obsolete institutional entry.

## Fix path A: the old profile appears in Device Management

First check for an ordinarily installed configuration profile:

```bash
sudo profiles show -type=configuration
```

You can also check:

**System Settings → General → Device Management**

If a removable profile clearly belongs to your former institution, remove it through System Settings whenever possible. Restart the Mac, forget `eduroam`, and reconnect according to the official instructions from your **current home institution**.

Do not remove profiles imposed by an employer, school-management system, or device-management service without permission.

## Fix path B: macOS says no profiles are installed, but the old 802.1X settings remain

This was our case.

The Terminal reported:

```text
There are no configuration profiles installed in the system domain
```

However, the Wi-Fi 802.1X panel still displayed a complete profile from the former university. That contradiction suggested that the visible configuration-profile container was gone while derived 802.1X state survived elsewhere.

Inspect the legacy system-wide EAPOL configuration:

```bash
sudo plutil -p /Library/Preferences/SystemConfiguration/com.apple.network.eapolclient.configuration.plist
```

Search the output for the former university’s:

- name;
- identity realm;
- authentication server;
- certificate authorities;
- or profile name.

Each saved object under `Profiles` has its own identifier. Do not use an identifier copied from another computer or article.

### Back up the configuration

Before changing anything:

```bash
sudo cp /Library/Preferences/SystemConfiguration/com.apple.network.eapolclient.configuration.plist "$HOME/Desktop/8021X-configuration-backup.plist"
```

### Remove only the confirmed obsolete entry

Replace the placeholder with the identifier shown on **your** Mac:

```bash
sudo /usr/libexec/PlistBuddy -c 'Delete :Profiles:YOUR-CONFIRMED-PROFILE-IDENTIFIER' /Library/Preferences/SystemConfiguration/com.apple.network.eapolclient.configuration.plist
```

Then:

1. Restart the Mac.
2. Forget `eduroam` under Known Networks if it remains there.
3. Join eduroam using the identity format required by your current institution.
4. Verify the authentication-server certificate against the institution’s official instructions before trusting it.
5. Return to the 802.1X panel and confirm that the former institution’s server, certificates, and profile name have disappeared.

In our case, the panel changed to:

```text
802.1X: Standard
```

The eduroam connection succeeded immediately.

## When to stop instead of running the removal command

Stop and seek help if:

- the plist does not exist;
- no entry clearly belongs to the former institution;
- more than one profile may still be needed;
- the Mac is managed by a university or employer;
- the command returns `Operation not permitted`;
- you cannot verify the current institution’s expected realm, server, and certificates;
- or you do not understand which object the command will change.

Take screenshots of the 802.1X panel and provide redacted output from the read-only `plutil` command to your IT helpdesk. Never disclose passwords, private keys, recovery keys, complete Keychain dumps, or unredacted logs.

## Check this before clearing more of Keychain

A clean Keychain does not necessarily mean a clean eduroam configuration.

macOS can store different parts of one enterprise Wi-Fi connection in different places:

- usernames and passwords;
- certificate identities and private keys;
- certificate-trust decisions;
- remembered Wi-Fi networks;
- user preferences;
- installed configuration-profile containers;
- and system-wide EAPOL/802.1X policy.

Removing relevant passwords and certificate records from Keychain may only cause macOS to ask for credentials again. It does not necessarily remove the policy that determines the outer identity, trusted authentication server, certificates, or EAP settings used with those credentials.

That is why repeated credential prompts can be misleading. A new prompt proves that macOS needs a credential; it does not prove that macOS has discarded the former university’s institutional configuration.

Do not respond by deleting unrelated root certificates, private keys, or complete Keychains. Inspect the active 802.1X configuration instead.

## Confirm that this situation actually applies to you

The old profile is not automatically wrong merely because you are visiting a new campus.

The eduroam service is designed to let visitors authenticate with credentials from their home institution. If an FU Berlin student visits HKUST and continues using FU Berlin credentials, the FU profile remains appropriate.

The conflict arises when your **home identity changes**—for example, after graduation or enrolment at a new university—but the Mac keeps applying the former institution’s profile to the same `eduroam` SSID.

This article also does not claim that every MSCHAPv2 error 691 is caused by an orphaned profile. Error 691 can indicate genuinely incorrect credentials or another inner-authentication rejection. The former-institution check belongs near the beginning when the account works on another device and the user has changed institutional affiliations.

---

## The full explanation

### What happened to Shine

Shine’s Mac could connect to every ordinary Wi-Fi network available to it. It could use an iPhone hotspot. Her iPhone connected to HKUST’s eduroam using her HKUST account.

Only the Mac failed.

Its connection sequence was unusual. macOS displayed an additional generic 802.1X prompt, appeared connected briefly, asked for university credentials again, and then failed. Logs eventually revealed:

```text
MSCHAPv2 Error = 691
```

The Wi-Fi radio had associated with the access point. The exchange had reached PEAP/MSCHAPv2 authentication. The server rejected what it received.

The error looked like an incorrect username or password, but the same account worked on the iPhone. That contradiction became the centre of the investigation.

### What we tried before finding the cause

The problem first looked like damaged user-level authentication state. The Mac forgot eduroam. Old certificates and relevant Keychain entries were removed. The Wi-Fi network service was recreated. No visible configuration profiles remained.

Nothing changed.

The proposed interventions became progressively larger: reset deeper network preferences, create a clean macOS user, reinstall macOS, or erase the computer completely.

The new-user test was important. If eduroam worked in a clean user, the fault would belong to Shine’s original account. If it failed there too, moving files into a replacement account would not solve the problem.

The fresh user failed in exactly the same way.

That result established that the relevant state was not confined to Shine’s ordinary user preferences or login Keychain. It also made a system reset appear reasonable—until one screenshot changed the diagnosis.

### The screenshot that exposed the old institution

The Wi-Fi 802.1X panel displayed a named profile:

```text
eduroam - SSID eduroam
```

Its details included:

```text
Authentication: PEAP
Trusted server: rad-net.zedat.fu-berlin.de
```

The trusted certificates belonged to the German DFN/T-TeleSec environment. The profile also supplied an outer identity in the `fu-berlin.de` realm.

Shine was entering an HKUST account. HKUST expected its own identity realm and authentication server, `wireless.ust.hk`.

The Mac was therefore not merely remembering an old password. It was applying FU Berlin’s authentication policy to HKUST credentials because both institutional configurations targeted the same SSID: `eduroam`.

### Why the empty `profiles` result led us to the plist

The command:

```bash
sudo profiles show -type=configuration
```

did not identify the plist by itself. The diagnosis came from three observations together:

1. The graphical 802.1X panel visibly showed a named profile with detailed FU Berlin settings.
2. The profile-management system reported that no configuration-profile container was installed.
3. The same FU Berlin configuration affected a newly created macOS user.

The first two observations created a storage contradiction. The values were too specific to have been discovered automatically from HKUST’s network, yet the ordinary installed-profile database claimed to be empty.

The third observation excluded an ordinary per-user preference or login-Keychain explanation. The remaining target was a system-wide EAPOL/802.1X persistence layer.

We found it here:

```text
/Library/Preferences/SystemConfiguration/
com.apple.network.eapolclient.configuration.plist
```

Reading the file revealed the exact profile name, SSID, outer identity, trusted certificates, and FU Berlin server shown in the graphical interface. Its metadata included `com.apple.mcx.configurationprofiles.8021X` and a payload UUID, indicating that the EAPOL entry had originally been derived from a configuration profile.

Only then was the plist confirmed as the cause.

The diagnostic chain was:

```text
FU settings visible in Wi-Fi
        +
no installed profile reported
        +
same settings affect a fresh user
        ↓
inspect system-wide EAPOL configuration
        ↓
exact FU settings found in the plist
        ↓
back up the file and remove only that entry
```

The visible configuration profile was gone. Its derived 802.1X configuration had survived.

### Why Keychain cleanup could not remove it

Keychain and SystemConfiguration were holding different parts of the connection.

Clearing Keychain removed plausible saved credentials, identities, or trust records. It did not alter the stale profile’s outer identity, trusted RADIUS server, or EAP policy in the system-wide plist.

On the next attempt, macOS requested credentials again and then supplied them within the same incorrect FU Berlin configuration. The prompt looked fresh; the policy behind it was not.

The lesson is not to clear more data indiscriminately. It is to determine which storage layer contains the state demonstrated by the evidence.

### Why HKUST’s IT centre might not see the problem

The eduroam network is a federated service. The realm after `@` in the outer identity helps route an authentication request through the RADIUS hierarchy toward the user’s home institution. The inner identity is then presented inside the protected EAP tunnel.

The stale profile forced an outer identity in the FU Berlin realm while Shine entered HKUST credentials. It is therefore plausible that the authentication was routed toward the former institution and rejected there, producing error 691 before HKUST’s identity system could authenticate the account.

From HKUST’s perspective:

- the HKUST account was valid;
- the campus eduroam service worked;
- the iPhone authenticated successfully;
- and the Mac’s failed request may not have reached HKUST through the expected institutional route.

The decisive evidence lived on the endpoint, inside configuration created by another institution. A helpdesk following the new university’s standard guide would have little reason to inspect that exact legacy file unless it had previously encountered the same cross-institutional residue.

The problem was not simply at FU Berlin or HKUST. It lived in the client configuration connecting the two institutional contexts.

### Profile-managed and Standard 802.1X are both eduroam

After the obsolete entry was removed, the Mac displayed:

```text
802.1X: Standard
```

This did not mean that HKUST used a completely different networking technology. Both institutions used eduroam and IEEE 802.1X. The difference was the provisioning approach and institution-specific configuration.

Some universities distribute CAT installers or `.mobileconfig` profiles that pin the expected identity realm, EAP settings, authentication servers, and certificates. Others instruct macOS users to connect through its Standard/User Mode flow.

This is not a dependable Europe-versus-Asia division. Institutions in the same country can choose different approaches. The accurate rule is:

> eduroam configuration is institution-specific, even though the SSID is globally shared.

### What this case permits us to conclude

The narrow conclusion is more useful than a universal claim:

> After a person changes eduroam home institutions, a former institution’s profile can survive outside the visible configuration-profile interface and continue controlling `eduroam` system-wide on macOS.

That possibility deserves an early troubleshooting check because it is fast, evidence-based, and may prevent disproportionate interventions.

A reasonable diagnostic order is:

1. Confirm that ordinary Wi-Fi works.
2. Confirm the current institutional account on another device.
3. Inspect **Wi-Fi → Details → 802.1X** for a former institution’s profile, realm, server, or certificates.
4. Compare those values with the current home institution’s official instructions.
5. Check both visible configuration profiles and the legacy system-wide EAPOL configuration.
6. Back up the file and remove only an identified obsolete entry.
7. Consider user migration, OS reinstallation, or erasure only after targeted configuration checks fail.

## Windows and Linux

The paths, interface labels, and commands in this article are specific to macOS. Do not copy them into Windows or Linux instructions.

The diagnostic question may still transfer:

> Is this device still applying the former home institution’s realm, EAP method, certificate authorities, or trusted RADIUS servers to `eduroam`?

Windows may receive enterprise Wi-Fi settings through WLAN profiles, device management, or institutional policy. Linux may store them through NetworkManager, `wpa_supplicant`, `iwd`, or another distribution-specific service. Inspection and removal depend on the platform, networking stack, and whether the device is managed.

Begin with the current home institution’s official instructions or its [eduroam CAT](https://cat.eduroam.org/) installer. If normal cleanup fails, inspect the active eduroam profile for the former institution’s realm and trust settings before reinstalling the operating system.
