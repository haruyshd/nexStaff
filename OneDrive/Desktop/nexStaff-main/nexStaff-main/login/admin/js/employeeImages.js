// Employee image mappings
const EmployeeImages = {    getImagePath(name) {        const imageMappings = {            'Jazz Lee': './admin/img/lee.png',
            'Yuji Lowe': './admin/img/lowe.png',
            'Marc Cea': './admin/img/cea.png',
            'Jericho DelosReyes': './admin/img/delosreyes.png'
        };
        return imageMappings[name] || null;
    }
};
