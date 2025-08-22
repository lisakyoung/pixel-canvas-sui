module pixel_canvas::errors {
    // Factory errors
    const EInvalidFee: u64 = 100;
    const ESeedLimitExceeded: u64 = 101;
    const EInvalidSeedCoordinates: u64 = 102;
    const EDuplicateSeedPixel: u64 = 103;
    
    // Canvas errors
    const ECanvasCompleted: u64 = 200;
    const EPixelOutOfBounds: u64 = 201;
    const EPixelAlreadyPainted: u64 = 202;
    const ECooldownActive: u64 = 203;
    const EContributionLimitExceeded: u64 = 204;
    
    // Auction errors
    const EAuctionNotStarted: u64 = 300;
    const EAuctionEnded: u64 = 301;
    const EBidTooLow: u64 = 302;
    const EAuctionNotEnded: u64 = 303;
    const EAuctionAlreadySettled: u64 = 304;
    
    // Claim errors
    const EAlreadyClaimed: u64 = 400;
    const ENotContributor: u64 = 401;
    const ENotProposer: u64 = 402;
    
    public fun invalid_fee(): u64 { EInvalidFee }
    public fun seed_limit_exceeded(): u64 { ESeedLimitExceeded }
    public fun invalid_seed_coordinates(): u64 { EInvalidSeedCoordinates }
    public fun duplicate_seed_pixel(): u64 { EDuplicateSeedPixel }
    
    public fun canvas_completed(): u64 { ECanvasCompleted }
    public fun pixel_out_of_bounds(): u64 { EPixelOutOfBounds }
    public fun pixel_already_painted(): u64 { EPixelAlreadyPainted }
    public fun cooldown_active(): u64 { ECooldownActive }
    public fun contribution_limit_exceeded(): u64 { EContributionLimitExceeded }
    
    public fun auction_not_started(): u64 { EAuctionNotStarted }
    public fun auction_ended(): u64 { EAuctionEnded }
    public fun bid_too_low(): u64 { EBidTooLow }
    public fun auction_not_ended(): u64 { EAuctionNotEnded }
    public fun auction_already_settled(): u64 { EAuctionAlreadySettled }
    
    public fun already_claimed(): u64 { EAlreadyClaimed }
    public fun not_contributor(): u64 { ENotContributor }
    public fun not_proposer(): u64 { ENotProposer }
}