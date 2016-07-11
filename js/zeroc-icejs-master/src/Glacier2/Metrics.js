// **********************************************************************
//
// Copyright (c) 2003-2014 ZeroC, Inc. All rights reserved.
//
// This copy of Ice is licensed to you under the terms described in the
// ICE_LICENSE file included in this distribution.
//
// **********************************************************************
//
// Ice version 3.6b
//
// <auto-generated>
//
// Generated from file `Metrics.ice'
//
// Warning: do not edit this file.
//
// </auto-generated>
//

/* slice2js browser-bundle-skip */
(function(module, require, exports)
{
/* slice2js browser-bundle-skip-end */
/* slice2js browser-bundle-skip */
    var __M = require("../Ice/ModuleRegistry").Ice.__M;
    var Ice = __M.require(module, 
    [
        "../Ice/Object",
        "../Ice/ObjectPrx",
        "../Ice/Long",
        "../Ice/HashMap",
        "../Ice/HashUtil",
        "../Ice/ArrayUtil",
        "../Ice/StreamHelpers"
    ]).Ice;
    
    var IceMX = require("../Ice/Metrics").IceMX;
    var Slice = Ice.Slice;
/* slice2js browser-bundle-skip-end */

    /**
     * Provides information on Glacier2 sessions.
     * 
     **/
    IceMX.SessionMetrics = Slice.defineObject(
        function(id, total, current, totalLifetime, failures, forwardedClient, forwardedServer, routingTableSize, queuedClient, queuedServer, overriddenClient, overriddenServer)
        {
            IceMX.Metrics.call(this, id, total, current, totalLifetime, failures);
            this.forwardedClient = forwardedClient !== undefined ? forwardedClient : 0;
            this.forwardedServer = forwardedServer !== undefined ? forwardedServer : 0;
            this.routingTableSize = routingTableSize !== undefined ? routingTableSize : 0;
            this.queuedClient = queuedClient !== undefined ? queuedClient : 0;
            this.queuedServer = queuedServer !== undefined ? queuedServer : 0;
            this.overriddenClient = overriddenClient !== undefined ? overriddenClient : 0;
            this.overriddenServer = overriddenServer !== undefined ? overriddenServer : 0;
        },
        IceMX.Metrics, undefined, 2,
        [
            "::Ice::Object",
            "::IceMX::Metrics",
            "::IceMX::SessionMetrics"
        ],
        -1,
        function(__os)
        {
            __os.writeInt(this.forwardedClient);
            __os.writeInt(this.forwardedServer);
            __os.writeInt(this.routingTableSize);
            __os.writeInt(this.queuedClient);
            __os.writeInt(this.queuedServer);
            __os.writeInt(this.overriddenClient);
            __os.writeInt(this.overriddenServer);
        },
        function(__is)
        {
            this.forwardedClient = __is.readInt();
            this.forwardedServer = __is.readInt();
            this.routingTableSize = __is.readInt();
            this.queuedClient = __is.readInt();
            this.queuedServer = __is.readInt();
            this.overriddenClient = __is.readInt();
            this.overriddenServer = __is.readInt();
        },
        false);

    IceMX.SessionMetricsPrx = Slice.defineProxy(IceMX.MetricsPrx, IceMX.SessionMetrics.ice_staticId, undefined);

    Slice.defineOperations(IceMX.SessionMetrics, IceMX.SessionMetricsPrx);
/* slice2js browser-bundle-skip */
    exports.IceMX = IceMX;
/* slice2js browser-bundle-skip-end */
/* slice2js browser-bundle-skip */
}
(typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? module : undefined,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? require : window.Ice.__require,
 typeof(global) !== "undefined" && typeof(global.process) !== "undefined" ? exports : window));
/* slice2js browser-bundle-skip-end */
