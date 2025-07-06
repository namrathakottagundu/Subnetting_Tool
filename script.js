function calculateSubnets() {
    const ipAddress = document.getElementById('ipAddress').value.trim();
    const subnetMask = parseInt(document.getElementById('subnetMask').value);

    if (!validateIP(ipAddress)) {
        alert('Please enter a valid IP address.');
        return;
    }

    // Split the IP address into parts and calculate details
    const ipParts = ipAddress.split('.').map(Number);
    const totalHosts = Math.pow(2, 32 - subnetMask);
    const usableHosts = totalHosts - 2; // Subtract 2 for network and broadcast

    const subnetMaskBinary = '1'.repeat(subnetMask) + '0'.repeat(32 - subnetMask);
    const subnetMaskDecimal = [
        parseInt(subnetMaskBinary.substring(0, 8), 2),
        parseInt(subnetMaskBinary.substring(8, 16), 2),
        parseInt(subnetMaskBinary.substring(16, 24), 2),
        parseInt(subnetMaskBinary.substring(24, 32), 2)
    ];

    const wildcardMask = subnetMaskDecimal.map(octet => 255 - octet);

    const networkAddressBinary = ipParts
        .map((octet, index) => octet.toString(2).padStart(8, '0'))
        .join('').substring(0, subnetMask) + '0'.repeat(32 - subnetMask);

    const networkAddressDecimal = [
        parseInt(networkAddressBinary.substring(0, 8), 2),
        parseInt(networkAddressBinary.substring(8, 16), 2),
        parseInt(networkAddressBinary.substring(16, 24), 2),
        parseInt(networkAddressBinary.substring(24, 32), 2)
    ];

    const broadcastAddressBinary = networkAddressBinary.substring(0, subnetMask) + '1'.repeat(32 - subnetMask);
    const broadcastAddressDecimal = [
        parseInt(broadcastAddressBinary.substring(0, 8), 2),
        parseInt(broadcastAddressBinary.substring(8, 16), 2),
        parseInt(broadcastAddressBinary.substring(16, 24), 2),
        parseInt(broadcastAddressBinary.substring(24, 32), 2)
    ];

    const firstUsableHost = [...networkAddressDecimal];
    firstUsableHost[3] += 1;

    const lastUsableHost = [...broadcastAddressDecimal];
    lastUsableHost[3] -= 1;

    const ipClass = getClass(ipParts[0]);

    // Store the values in sessionStorage
    sessionStorage.setItem('ipAddress', ipAddress);
    sessionStorage.setItem('subnetMask', subnetMaskDecimal.join('.'));
    sessionStorage.setItem('wildcardMask', wildcardMask.join('.'));
    sessionStorage.setItem('binarySubnetMask', subnetMaskBinary.match(/.{1,8}/g).join('.'));
    sessionStorage.setItem('networkAddress', networkAddressDecimal.join('.'));
    sessionStorage.setItem('firstUsableHost', firstUsableHost.join('.'));
    sessionStorage.setItem('lastUsableHost', lastUsableHost.join('.'));
    sessionStorage.setItem('broadcastAddress', broadcastAddressDecimal.join('.'));
    sessionStorage.setItem('totalHosts', totalHosts);
    sessionStorage.setItem('usableHosts', usableHosts);
    sessionStorage.setItem('ipClass', ipClass);
    sessionStorage.setItem('cidrNotation', `/${subnetMask}`);
    sessionStorage.setItem('ipType', isPrivateIP(ipParts) ? 'Private' : 'Public');

    // Display results on the page with clickable links to detailed pages
    document.getElementById('result').innerHTML = `
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p><strong>Subnet Mask:</strong> <a href="subnet.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${subnetMaskDecimal.join('.')} (/ ${subnetMask})</a></p>
        <p><strong>Wildcard Mask:</strong> <a href="wildcard.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${wildcardMask.join('.')}</a></p>
        <p><strong>Binary Subnet Mask:</strong> <a href="bsm.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${subnetMaskBinary.match(/.{1,8}/g).join('.')}</a></p>
        <p><strong>Network Address:</strong> <a href="network.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${networkAddressDecimal.join('.')}</a></p>
        <p><strong>Usable Host IP Range:</strong> <a href="usable-host-range.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${firstUsableHost.join('.')} - ${lastUsableHost.join('.')}</a></p>
        <p><strong>Broadcast Address:</strong> <a href="broadcast-address.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${broadcastAddressDecimal.join('.')}</a></p>
        <p><strong>Total Number of Hosts:</strong> <a href="total-hosts.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${totalHosts}</a></p>
        <p><strong>Number of Usable Hosts:</strong> <a href="usable-hosts.html?ip=${encodeURIComponent(ipAddress)}&subnet=${encodeURIComponent(subnetMask)}">${usableHosts}</a></p>
        <p><strong>IP Class:</strong> <a href="ip-class.html?ip=${encodeURIComponent(ipAddress)}">${ipClass}</a></p>
        <p><strong>CIDR Notation:</strong> /${subnetMask}</p>
    `;
    document.getElementById('result').style.display = 'block';
}


// Helper function to validate IP address
function validateIP(ip) {
    const regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
    return regex.test(ip);
}

// Helper function to determine the IP class
function getClass(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) return 'A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E';
    return 'Unknown';
}

// Helper function to check if the IP address is private
function isPrivateIP(ipParts) {
    return (
        (ipParts[0] === 10) ||
        (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
        (ipParts[0] === 192 && ipParts[1] === 168)
    );
}

// subnet

//storing prevv

document.addEventListener("DOMContentLoaded", function () {
    const ipAddress = sessionStorage.getItem('ipAddress');
    const subnetMask = sessionStorage.getItem('subnetMask');
    const wildcardMask = sessionStorage.getItem('wildcardMask');
    const binarySubnetMask = sessionStorage.getItem('binarySubnetMask');
    const networkAddress = sessionStorage.getItem('networkAddress');
    const firstUsableHost = sessionStorage.getItem('firstUsableHost');
    const lastUsableHost = sessionStorage.getItem('lastUsableHost');
    const broadcastAddress = sessionStorage.getItem('broadcastAddress');
    const totalHosts = sessionStorage.getItem('totalHosts');
    const usableHosts = sessionStorage.getItem('usableHosts');
    const ipClass = sessionStorage.getItem('ipClass');
    const cidrNotation = sessionStorage.getItem('cidrNotation');
    const ipType = sessionStorage.getItem('ipType');

    // Display the results on this page
    document.getElementById('result').innerHTML = `
        <p><strong>IP Address:</strong> ${ipAddress}</p>
        <p><strong>Subnet Mask:</strong> ${subnetMask}</p>
        <p><strong>Wildcard Mask:</strong> ${wildcardMask}</p>
        <p><strong>Binary Subnet Mask:</strong> ${binarySubnetMask}</p>
        <p><strong>Network Address:</strong> ${networkAddress}</p>
        <p><strong>Usable Host IP Range:</strong> ${firstUsableHost} - ${lastUsableHost}</p>
        <p><strong>Broadcast Address:</strong> ${broadcastAddress}</p>
        <p><strong>Total Number of Hosts:</strong> ${totalHosts}</p>
        <p><strong>Number of Usable Hosts:</strong> ${usableHosts}</p>
        <p><strong>IP Class:</strong> ${ipClass}</p>
        <p><strong>CIDR Notation:</strong> ${cidrNotation}</p>
        <p><strong>IP Type:</strong> ${ipType}</p>
    `;
});
